// ----------------------------------------------------
// 뉴스 기사 페이지 (article.html?tab=latest&id=...)
// ----------------------------------------------------
// 뉴스 카드를 누르면 이 페이지에서 번역된 기사를 보여 준다.
// - 경기 리포트(위키백과, CC BY-SA 4.0): 전문 번역 + 아래에 원문·편집 기록·라이선스 표시
// - 언론사 기사: 언론사 저작물이라 사이트에 저장하지 않고 제목·요약·본문 앞부분만 보여 주며,
//   '전체 번역본 보기'로 번역기(Yandex)가 원문 페이지를 한국어로 띄워 주게 한다

const NEWS_TAB_NAMES = { latest: "최신 소식", report: "경기 리포트", tech: "테크 토크", column: "칼럼/블로그", video: "영상 뉴스" };

// 원문 기사 전체를 한국어로 띄워 주는 번역 페이지 주소 (Yandex 웹페이지 번역)
// 구글 번역의 웹페이지 번역(translate.goog)은 한국에서 "이 번역 서비스는 사용자 지역에서 제공되지 않습니다"로 막혀 있어서 쓰지 않는다.
function fullTranslateUrl(link) {
    let url = link;
    try {
        const u = new URL(link);
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(k => u.searchParams.delete(k));
        url = u.toString();
    } catch (e) { /* 주소가 이상하면 그대로 넘김 */ }
    return `https://translate.yandex.com/translate?view=compact&lang=en-ko&url=${encodeURIComponent(url)}`;
}

function renderArticleError(message) {
    document.getElementById("article-root").innerHTML = `
        <div class="text-center py-5">
            <i class="fa-regular fa-newspaper text-danger fs-1 mb-3"></i>
            <p class="text-white-50 mb-4">${message}</p>
            <a href="news.html" class="btn btn-outline-danger">뉴스 목록으로</a>
        </div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    let tabKey = params.get("tab");

    let data;
    try {
        data = await loadNewsData();
    } catch (e) {
        renderArticleError("뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
    }

    // 탭 이름이 없거나 틀려도 id로 찾는다
    let item = null;
    for (const key of [tabKey, ...Object.keys(data.tabs)]) {
        const found = key && data.tabs[key] && data.tabs[key].items.find(it => it.id === id);
        if (found) { item = found; tabKey = key; break; }
    }
    if (!item) {
        renderArticleError("기사를 찾을 수 없습니다. 오래되어 목록에서 빠진 기사일 수 있어요.");
        return;
    }

    const tab = data.tabs[tabKey];
    const isVideo = tabKey === "video";
    const isFull = Array.isArray(item.body);  // 전문을 실어도 되는 출처 (위키백과)
    const title = item.titleKo || item.title;
    document.title = `${title} - PROJECT_TELEMETRY`;

    const hero = isVideo
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.videoId)}" title="${escapeHtml(title)}"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : (item.image ? `<img src="${escapeHtml(item.image)}" alt="" onerror="this.remove()"${isFull ? ' class="contain"' : ""}>` : "");

    const fullBody = isFull ? item.body.map(sec => `
        ${sec.h ? `<h${sec.level <= 2 ? 3 : 4} class="article-h${sec.level}">${escapeHtml(sec.hKo || sec.h)}</h${sec.level <= 2 ? 3 : 4}>
                   <p class="en en-h">${escapeHtml(sec.h)}</p>` : ""}
        ${sec.p.map((en, i) => `<p>${escapeHtml(sec.pKo[i] || en)}</p><p class="en">${escapeHtml(en)}</p>`).join("")}`).join("") : "";

    const lead = (item.leadKo || []).map((ko, i) => `
        <p>${escapeHtml(ko)}</p>
        <p class="en">${escapeHtml((item.lead || [])[i] || "")}</p>`).join("");

    const buttons = isVideo
        ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="btn btn-danger fw-bold px-4"><i class="fa-brands fa-youtube me-2"></i>유튜브에서 보기</a>`
        : `<a href="${escapeHtml(fullTranslateUrl(item.link))}" target="_blank" rel="noopener" class="btn btn-danger fw-bold px-4"><i class="fa-solid fa-language me-2"></i>전체 번역본 보기</a>
           <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="btn btn-outline-light px-4">원문 보기 <i class="fa-solid fa-arrow-up-right-from-square ms-1 small"></i></a>`;

    const related = tab.items.filter(it => it.id !== item.id).slice(0, 4).map(it => `
        <div class="col-md-6">
            <a class="related-card" href="article.html?tab=${tabKey}&id=${it.id}">
                <img src="${escapeHtml(it.image || "img/favicon.svg")}" alt="" loading="lazy"${it.body ? ' class="map"' : ""}>
                <div>
                    <small class="text-white-50">${timeAgo(it.date)}</small>
                    <h6>${escapeHtml(it.titleKo || it.title)}</h6>
                </div>
            </a>
        </div>`).join("");

    document.getElementById("article-root").innerHTML = `
        <a href="news.html#${tabKey}" class="article-back"><i class="fa-solid fa-arrow-left me-2"></i>${NEWS_TAB_NAMES[tabKey] || "뉴스"} 목록</a>

        <div class="article-meta d-flex flex-wrap align-items-center gap-2 mt-4 mb-3">
            <span class="badge">${NEWS_TAB_NAMES[tabKey] || "뉴스"}</span>
            <span>${escapeHtml(tab.source)}</span>
            ${item.author ? `<span>· ${escapeHtml(item.author)}</span>` : ""}
            <span>· ${timeAgo(item.date)}</span>
        </div>
        <h1 class="article-title mb-2">${escapeHtml(title)}</h1>
        ${item.titleKo ? `<p class="article-original mb-4">${escapeHtml(item.title)}</p>` : ""}

        ${hero ? `<div class="article-hero mb-4">${hero}</div>` : ""}

        ${!isVideo && !isFull && (item.descKo || item.desc) ? `
            <div class="article-label mb-2">요약</div>
            <div class="article-summary mb-5">${escapeHtml(item.descKo || item.desc)}</div>` : ""}

        ${isFull ? `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="article-label">본문 · 자동 번역</div>
                <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" id="show-en">
                    <label class="form-check-label text-white-50 small" for="show-en">영어 원문 함께 보기</label>
                </div>
            </div>
            <div class="article-body" id="article-body">${fullBody}</div>` : ""}

        ${lead && !isFull ? `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="article-label">본문 앞부분 · 자동 번역</div>
                <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" id="show-en">
                    <label class="form-check-label text-white-50 small" for="show-en">영어 원문 함께 보기</label>
                </div>
            </div>
            <div class="article-body article-fade" id="article-body">${lead}</div>` : ""}

        ${isFull ? `
        <div class="article-cta mt-5 mb-5">
            <div class="article-label mb-2"><i class="fa-brands fa-creative-commons me-1"></i>출처와 라이선스</div>
            <p class="mb-3">이 글은 영어 위키백과의 <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="text-white">「${escapeHtml(item.title)}」</a> 문서를
               한국어로 기계 번역한 것입니다. 원문 작성자는 <a href="${escapeHtml(item.historyUrl)}" target="_blank" rel="noopener" class="text-white">위키백과 편집자들</a>이며,
               <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ko" target="_blank" rel="noopener" class="text-white">CC BY-SA 4.0</a> 라이선스를 따릅니다.
               번역본도 같은 라이선스로 이용할 수 있습니다. 변경 사항: 한국어 번역, 표·각주 생략.
               ${item.imageFile ? `사진: <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.imageFile)}" target="_blank" rel="noopener" class="text-white">Wikimedia Commons</a> (파일마다 라이선스가 표시되어 있음).` : ""}
               <br>마지막 수정: ${timeAgo(item.date)} · 순위표 등 표는 원문에서 확인하세요.</p>
            <div class="d-flex flex-wrap gap-2">
                <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="btn btn-danger fw-bold px-4"><i class="fa-brands fa-wikipedia-w me-2"></i>위키백과 원문 보기</a>
                <a href="${escapeHtml(item.historyUrl)}" target="_blank" rel="noopener" class="btn btn-outline-light px-4">편집 기록</a>
            </div>
        </div>` : `
        <div class="article-cta mt-4 mb-5">
            <p class="mb-3">${isVideo
                ? "F1 공식 유튜브 채널의 영상입니다."
                : `기사의 저작권은 <strong class="text-white">${escapeHtml(tab.source)}</strong>에 있어 앞부분만 소개합니다.
                   '전체 번역본 보기'를 누르면 번역기(Yandex)가 원문 기사 전체를 한국어로 보여 줍니다.
                   <br><span class="small">번역이 어색하면 '원문 보기'로 연 뒤 Chrome 주소창 오른쪽의 번역 아이콘 <i class="fa-solid fa-language"></i>을 눌러 한국어로 바꿔 보세요.</span>`}</p>
            <div class="d-flex flex-wrap gap-2">${buttons}</div>
        </div>`}

        ${related ? `
            <h5 class="fw-black text-white border-bottom border-danger pb-2 mb-3">${NEWS_TAB_NAMES[tabKey] || "뉴스"}의 다른 기사</h5>
            <div class="row g-3">${related}</div>` : ""}
    `;

    const toggle = document.getElementById("show-en");
    if (toggle) toggle.addEventListener("change", () => document.getElementById("article-body").classList.toggle("show-en", toggle.checked));
    window.scrollTo(0, 0);
});
