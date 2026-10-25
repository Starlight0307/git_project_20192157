"""F1 뉴스 수집기 — 탭마다 RSS를 받아 한글로 번역해 data/news.json으로 저장한다.

뉴스 사이트들은 브라우저에서 직접 읽는 것(CORS)을 막아 두었고, 중간에서 대신 받아 주던
rss2json·allorigins 같은 무료 서비스도 자주 막히거나 멈춘다. 그래서 GitHub Actions가 1시간마다
이 스크립트를 실행해 뉴스를 미리 받아 두고, 사이트(news.js · home.js)는 이 파일만 읽는다.

    python3 tools/fetch_news.py          # 20192157_황휘 폴더에서 실행 (표준 라이브러리만 사용)

- 탭마다 출처를 겹치지 않게 골랐다 (예전 '칼럼' 탭의 Autosport는 Motorsport.com과 같은 회사라 같은 기사가 나왔음)
- 이미 번역한 기사는 이전 news.json에서 그대로 가져와 번역 요청을 줄인다
- 한 출처가 실패하면 그 탭은 이전 내용을 그대로 둔다 (빈 화면이 되지 않게)
- 기사 본문은 앞 몇 문단(LEAD_PARAS)만 번역해 둔다. 전문을 저장하면 언론사 저작물을 통째로 복제·배포하게 되므로,
  사이트 기사 페이지(article.html)는 앞부분만 보여 주고 '전체 번역본 보기'로 번역기(Yandex)가 띄운 원문을 연다
"""
import hashlib
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "news.json"
PER_TAB = 9  # 탭마다 기사 수 (화면은 3열이라 3의 배수)
LEAD_PARAS = 3  # 기사 페이지에 보여 줄 앞부분 문단 수
AD_TEXT = re.compile(r"^Advertisement\b|Become a Supporter|Subscribe to|Sign up for", re.I)

FEEDS = {
    # body: 기사 페이지에서 본문이 시작되는 표시 (이 뒤의 <p>부터 앞 문단을 뽑는다)
    "latest": {"name": "Motorsport.com", "url": "https://www.motorsport.com/rss/f1/news/", "body": "ms-article-content"},
    "tech": {"name": "The Race", "url": "https://the-race.com/category/formula-1/feed/", "body": "gh-content"},
    "column": {"name": "RaceFans", "url": "https://www.racefans.net/category/f1-features/comment/feed/", "body": "entry-content"},
    "video": {"name": "FORMULA 1 YouTube", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg"},
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    "Accept": "*/*",
}
NS = {
    "media": "http://search.yahoo.com/mrss/",
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "content": "http://purl.org/rss/1.0/modules/content/",
}


def get(url, timeout=20, extra=None):
    req = urllib.request.Request(url, headers={**HEADERS, **(extra or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def clean(text, limit=None):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    text = re.sub(r"\s+", " ", text).strip()
    if limit and len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


def iso(date_text):
    try:
        d = parsedate_to_datetime(date_text) if "," in (date_text or "") else datetime.fromisoformat(date_text)
        return d.astimezone(timezone.utc).isoformat()
    except Exception:
        return ""


def read_article(url, body_mark):
    """기사 페이지에서 대표 이미지(og:image)와 본문 앞 LEAD_PARAS개 문단을 뽑는다."""
    try:
        page = get(url, timeout=15).decode("utf-8", "ignore")
    except Exception:
        return "", []
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', page) or \
        re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', page)
    image = html.unescape(m.group(1)) if m else ""
    start = page.find(body_mark) if body_mark else -1
    paras = []
    if start >= 0:
        for p in re.findall(r"<p[^>]*>(.*?)</p>", page[start:start + 60000], re.S):
            text = clean(p, 450)
            if len(text) >= 40 and not AD_TEXT.search(text):  # 사진 설명·광고 문구는 건너뜀
                paras.append(text)
            if len(paras) == LEAD_PARAS:
                break
    return image, paras


def translate(text):
    """영어 → 한국어. 실패하면 빈 문자열 (화면에서는 영어 원문을 대신 보여 준다)."""
    if not text:
        return ""
    q = urllib.parse.quote(text)
    for url in (f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q={q}",
                f"https://api.mymemory.translated.net/get?q={q}&langpair=en|ko"):
        try:
            data = json.loads(get(url, timeout=15, extra={"Origin": "http://localhost:5500", "Referer": "http://localhost:5500/"}))
            ko = "".join(s[0] for s in data[0] if s and s[0]) if isinstance(data, list) else data["responseData"]["translatedText"]
            if ko and ko.strip() != text.strip():
                return ko.strip()
        except Exception:
            continue
    return ""


def parse_rss(xml_bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for it in root.iter("item"):
        image = ""
        enc = it.find("enclosure")
        if enc is not None and enc.get("type", "image").startswith("image"):
            image = enc.get("url", "")
        if not image:
            for tag in ("media:content", "media:thumbnail"):
                mc = it.find(tag, NS)  # 자식이 없는 요소는 거짓으로 취급되므로 `or`로 잇지 않는다
                if mc is not None and mc.get("url"):
                    image = mc.get("url")
                    break
        if not image:
            m = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)', it.findtext("content:encoded", "", NS) + it.findtext("description", ""))
            image = m.group(1) if m else ""
        title = clean(it.findtext("title"))
        title = re.sub(r"\s*\|\s*(Comment|Analysis|Opinion)$", "", title)  # RaceFans 제목 끝의 '| Comment'
        items.append({
            "title": title,
            "desc": clean(it.findtext("description"), 180),
            "link": (it.findtext("link") or "").strip(),
            "image": image,
            "date": iso(it.findtext("pubDate")),
            "author": clean(it.findtext("{http://purl.org/dc/elements/1.1/}creator")),
        })
    return items


def parse_youtube(xml_bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for e in root.findall("atom:entry", NS):
        vid = e.findtext("yt:videoId", "", NS)
        group = e.find("media:group", NS)
        desc = group.findtext("media:description", "", NS) if group is not None else ""
        items.append({
            "title": clean(e.findtext("atom:title", "", NS)),
            "desc": clean(desc.split("\n")[0], 180),
            "link": f"https://www.youtube.com/watch?v={vid}",
            "image": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
            "date": iso(e.findtext("atom:published", "", NS)),
            "author": "FORMULA 1",
            "videoId": vid,
        })
    return items


# ---------- 경기 리포트: 위키백과 그랑프리 문서 (전문 번역) ----------
# 위키백과 글은 CC BY-SA 4.0이라 출처·라이선스를 밝히면 번역해서 전문을 실을 수 있다.
# (번역본도 같은 CC BY-SA 4.0을 따른다 — article.js가 기사 아래에 출처·편집 기록·라이선스를 표시)
WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKI_UA = {"User-Agent": "PROJECT_TELEMETRY-news/1.0 (https://github.com/Starlight0307/git_project_20192157)"}
WIKI_SKIP = {"References", "External links", "Notes", "See also", "Footnotes", "Bibliography"}
REPORT_COUNT = 9
# 기계 번역이 F1 용어를 엉뚱하게 옮기는 것 바로잡기 (Qualifying → '적격', Race classification → '인종 분류' 등)
HEADING_KO = {
    "Background": "배경", "Entrants": "출전 명단", "Tyre choices": "타이어 선택", "Practice": "연습 주행",
    "Qualifying": "예선", "Qualifying report": "예선 리포트", "Qualifying classification": "예선 결과",
    "Sprint": "스프린트", "Sprint qualifying": "스프린트 예선", "Sprint qualifying report": "스프린트 예선 리포트",
    "Sprint qualifying classification": "스프린트 예선 결과", "Sprint report": "스프린트 리포트", "Sprint classification": "스프린트 결과",
    "Race": "결승", "Race report": "결승 리포트", "Race classification": "결승 결과", "Pre-race": "결승 전",
    "Post-race": "결승 후", "Post qualifying": "예선 후", "Penalties": "페널티", "Championship permutations": "챔피언십 경우의 수",
    "Championship standings before the race": "경기 전 챔피언십 순위", "Championship standings after the race": "경기 후 챔피언십 순위",
}
TERM_FIX = [  # (틀린 번역, 바른 말) — 소제목과 본문 모두에 적용
    ("가상 안전 차량", "버추얼 세이프티카"), ("안전 차량", "세이프티카"), ("위험 신호", "레드 플래그"),
    ("적격 보고서", "예선 리포트"), ("적격 분류", "예선 결과"), ("인종 분류", "결승 결과"),
]
HEAD_FIX = [("적격", "예선"), ("관행", "연습 주행"), ("보고서", "리포트"), ("처벌", "페널티"), ("자격", "예선")]


def fix_terms(text, heading=False):
    for wrong, right in TERM_FIX + (HEAD_FIX if heading else []):
        text = text.replace(wrong, right)
    return text


def fix_report(item):
    """번역을 다시 하지 않고 용어만 바로잡는다 (이전에 저장한 번역에도 매번 적용)."""
    for sec in item["body"]:
        keep = [i for i, p in enumerate(sec["p"]) if not TABLE_NOTE.match(p)]  # 예전에 저장된 각주 줄도 뺀다
        sec["p"], sec["pKo"] = [sec["p"][i] for i in keep], [sec["pKo"][i] for i in keep]
        if sec["h"]:
            sec["hKo"] = HEADING_KO.get(sec["h"]) or fix_terms(sec["hKo"], heading=True)
        sec["pKo"] = [fix_terms(p) for p in sec["pKo"]]
    item["body"] = [sec for sec in item["body"] if sec["p"]]
    item["descKo"] = fix_terms(item.get("descKo", ""))
    return item
REPORT_SEASON = "2026"


def wiki_query(**params):
    q = urllib.parse.urlencode({"format": "json", "formatversion": "2", "redirects": "1", **params})
    return json.loads(get(f"{WIKI_API}?{q}", extra=WIKI_UA))


TABLE_NOTE = re.compile(r"^(\^|Notes?$|Sources?:|Source$|— Source)")  # 결과표 밑 각주 줄 ('^a – ...', 'Notes', 'Source: ...')


def wiki_sections(text):
    """'== 제목 ==' 줄로 나뉜 위키백과 본문 → [{"h": 제목 또는 "", "level": 2~4, "p": [문단...]}]"""
    blocks, cur = [], {"h": "", "level": 1, "p": []}
    for line in text.split("\n"):
        line = line.strip()
        m = re.fullmatch(r"(={2,4})\s*(.+?)\s*\1", line)
        if m:
            blocks.append(cur)
            cur = {"h": m.group(2), "level": len(m.group(1)), "p": []}
        elif line and not TABLE_NOTE.match(line):
            cur["p"].append(line)
    blocks.append(cur)
    out, skipping = [], False
    for b in blocks:
        if b["level"] == 2:
            skipping = b["h"] in WIKI_SKIP
        if not skipping and b["p"]:  # 표만 있던 단락(출전 명단·순위표)은 글이 비어 빠진다
            out.append(b)
    return out


def fetch_reports(old_tab):
    """최근 치렀거나 이번 주에 열리는 그랑프리 위키백과 문서를 받아 전체를 번역한다."""
    races = json.loads(get(f"https://api.jolpi.ca/ergast/f1/{REPORT_SEASON}.json?limit=40"))["MRData"]["RaceTable"]["Races"]
    soon = datetime.now(timezone.utc).date().toordinal() + 7
    races = [r for r in races if datetime.fromisoformat(r["date"]).toordinal() <= soon][::-1]  # 최근 경기부터
    prev_by_title = {it["wikiTitle"]: it for it in (old_tab or {}).get("items", []) if it.get("wikiTitle")}
    known_ko = {en: ko for it in prev_by_title.values()
                for sec in it.get("body", []) for en, ko in zip(sec["p"] + [sec["h"]], sec["pKo"] + [sec["hKo"]])}

    items = []
    for race in races:
        if len(items) == REPORT_COUNT:
            break
        title = f"{REPORT_SEASON} {race['raceName']}"
        page = wiki_query(action="query", prop="extracts|revisions|pageimages|info", explaintext="1",
                          titles=title, rvprop="ids|timestamp", piprop="thumbnail|name", pithumbsize="1280",
                          pilicense="free", inprop="url")["query"]["pages"][0]
        # 아직 문서가 없는 경기는 시즌 문서로 넘겨지므로(redirect) 그랑프리 문서만 받는다
        if page.get("missing") or not page.get("extract") or "Grand Prix" not in page["title"]:
            print(f"  위키백과 문서 없음: {title}", file=sys.stderr)
            continue
        rev = page["revisions"][0]
        prev = prev_by_title.get(page["title"])
        if prev and prev.get("revid") == rev["revid"]:
            items.append(fix_report(prev))  # 문서가 그대로면 번역도 그대로
            continue

        body = wiki_sections(page["extract"])
        for sec in body:
            sec["hKo"] = known_ko.get(sec["h"]) or (translate(sec["h"]) if sec["h"] else "")
            sec["pKo"] = []
            for p in sec["p"]:
                ko = known_ko.get(p)
                if ko is None:
                    ko = translate(p) or p
                    time.sleep(0.2)
                sec["pKo"].append(ko)
        lead = body[0]["p"][0] if body and body[0]["p"] else ""
        url = page["fullurl"]
        items.append({
            "id": hashlib.sha1(url.encode()).hexdigest()[:10],
            "wikiTitle": page["title"],
            "title": page["title"],
            "titleKo": known_ko.get(page["title"]) or translate(page["title"]),
            "desc": clean(lead, 180),
            "descKo": clean(body[0]["pKo"][0], 180) if lead else "",
            "link": url,
            "historyUrl": f"{url}?action=history",
            "image": page.get("thumbnail", {}).get("source", ""),
            "imageFile": page.get("pageimage", ""),
            "date": rev["timestamp"],  # 마지막으로 고쳐진 시각
            "raceDate": race["date"],
            "author": "위키백과 편집자들",
            "revid": rev["revid"],
            "license": "CC BY-SA 4.0",
            "body": body,
        })
        fix_report(items[-1])
        print(f"  {page['title']}: {sum(len(s['p']) for s in body)}문단 번역")
    return items


def main():
    try:
        old = json.loads(OUT.read_text(encoding="utf-8"))
    except Exception:
        old = {"tabs": {}}
    known = {it["link"]: it for tab in old.get("tabs", {}).values() for it in tab.get("items", [])}
    old_snapshot = json.dumps(old.get("tabs"), sort_keys=True)  # 아래에서 이전 기사를 고쳐 쓰므로 비교용 사본을 먼저 떠 둔다

    tabs, failed = {}, []
    try:
        reports = fetch_reports(old.get("tabs", {}).get("report"))
        if not reports:
            raise ValueError("문서 0개")
        tabs["report"] = {"source": "Wikipedia", "sourceUrl": "https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship",
                          "license": "CC BY-SA 4.0", "items": reports}
        print(f"[report] Wikipedia: {len(reports)}개")
    except Exception as e:
        print(f"[report] Wikipedia 실패: {e}", file=sys.stderr)
        failed.append("report")
        if "report" in old.get("tabs", {}):
            tabs["report"] = old["tabs"]["report"]
    for key, feed in FEEDS.items():
        try:
            raw = get(feed["url"])
            items = (parse_youtube if key == "video" else parse_rss)(raw)[:PER_TAB]
            if not items:
                raise ValueError("기사 0개")
        except Exception as e:
            print(f"[{key}] {feed['name']} 실패: {e}", file=sys.stderr)
            failed.append(key)
            if key in old.get("tabs", {}):
                tabs[key] = old["tabs"][key]
            continue
        for it in items:
            it["id"] = hashlib.sha1(it["link"].encode()).hexdigest()[:10]  # 기사 페이지 주소용 (article.html?id=...)
            prev = known.get(it["link"])
            if prev and prev.get("titleKo") and (key == "video" or prev.get("leadKo")):
                for f in ("titleKo", "descKo", "lead", "leadKo"):
                    if f in prev:
                        it[f] = prev[f]
                it["image"] = it["image"] or prev.get("image", "")
                continue
            if key != "video":
                image, it["lead"] = read_article(it["link"], feed.get("body"))
                it["image"] = it["image"] or image
                it["leadKo"] = [translate(p) or p for p in it["lead"]]
            it["titleKo"] = translate(it["title"])
            it["descKo"] = translate(it["desc"]) if key != "video" else ""
            time.sleep(0.3)
        tabs[key] = {"source": feed["name"], "sourceUrl": feed["url"], "items": items}
        print(f"[{key}] {feed['name']}: {len(items)}개, 번역 {sum(1 for i in items if i.get('titleKo'))}개")

    if not tabs:
        sys.exit("모든 출처가 실패해서 파일을 바꾸지 않습니다")
    if json.dumps(tabs, sort_keys=True) == old_snapshot and failed == old.get("failed"):
        print("새 기사 없음 — 파일을 그대로 둡니다")  # 시각만 바뀐 커밋이 매시간 쌓이지 않게
        return
    OUT.parent.mkdir(exist_ok=True)
    data ={"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "failed": failed, "tabs": tabs}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print("저장:", OUT)


if __name__ == "__main__":
    main()
