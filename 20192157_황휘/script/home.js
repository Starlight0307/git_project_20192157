// ----------------------------------------------------
// 메인 홈페이지 Live, 순위, 뉴스 전용 기능 (home.js)
// ----------------------------------------------------

async function fetchLiveF1Data() {
    const nowUtcMs = Date.now();
    const cacheBuster = `?limit=100&t=${nowUtcMs}`;

    try {
        const res = await fetch(`${JOLPICA_BASE_URL}/2026.json${cacheBuster}`);
        const scheduleData = await res.json();
        const allRaces = scheduleData.MRData.RaceTable.Races;

        let allSessions = [];

        for (let race of allRaces) {
            let gpName = race.raceName;
            let circuitName = race.Circuit.circuitName;
            let circuitId = race.Circuit.circuitId;
            const round = race.round;
            const country = race.Circuit.Location.country;
            const locality = race.Circuit.Location.locality;
            const lat = race.Circuit.Location.lat, long = race.Circuit.Location.long;

            const addSession = (sessionName, date, time) => {
                if (!date || !time) return;
                const timeStr = time.endsWith('Z') ? time : `${time}Z`;
                const startUtcMs = new Date(`${date}T${timeStr}`).getTime();
                
                let durationMs = 60 * 60 * 1000;
                if (sessionName === "Race") durationMs = 1.5 * 60 * 60 * 1000; 
                const endUtcMs = startUtcMs + durationMs;

                allSessions.push({
                    gpName, circuitName, circuitId, round, country, locality, lat, long, sessionName, startUtcMs, endUtcMs, dateString: date
                });
            };

            if (race.FirstPractice) addSession("Practice 1", race.FirstPractice.date, race.FirstPractice.time);
            if (race.SecondPractice) addSession("Practice 2", race.SecondPractice.date, race.SecondPractice.time);
            if (race.ThirdPractice) addSession("Practice 3", race.ThirdPractice.date, race.ThirdPractice.time);
            if (race.SprintQualifying) addSession("Sprint Qualifying", race.SprintQualifying.date, race.SprintQualifying.time);
            if (race.Sprint) addSession("Sprint", race.Sprint.date, race.Sprint.time);
            if (race.Qualifying) addSession("Qualifying", race.Qualifying.date, race.Qualifying.time);
            addSession("Race", race.date, race.time || "00:00:00Z");
        }

        allSessions.sort((a, b) => a.startUtcMs - b.startUtcMs);

        let targetSession = null;
        let status = "UPCOMING";
        for (let session of allSessions) {
            if (nowUtcMs < session.endUtcMs) {
                targetSession = session;
                if (nowUtcMs >= session.startUtcMs) {
                    status = "LIVE";
                }
                break;
            }
        }

        if (!targetSession) {
            targetSession = allSessions[allSessions.length - 1];
            status = "SEASON_ENDED";
        }

        updateHeroUI(targetSession, status);
        renderGpCard(targetSession, status, allSessions.filter(s => s.round === targetSession.round));
        renderWatch(targetSession, status);
        const raceEnds = allSessions.filter(s => s.sessionName === "Race");
        renderHeroHud(targetSession, status, raceEnds.filter(s => nowUtcMs >= s.endUtcMs).length, raceEnds.length);

    } catch (error) {
        console.error('일정 데이터 호출 실패:', error);
    }
    fetchStandingsData();
}

function updateHeroUI(session, status) {
    const liveBadge = document.getElementById('live-badge');
    const heroSubTitle = document.getElementById('hero-sub-title');
    const heroDesc = document.getElementById('hero-desc');

    const sessionKo = sessionNamesKo[session.sessionName] || session.sessionName;
    const formattedKSTDate = formatKST(session.startUtcMs);

    if (status === "LIVE") {
        if(liveBadge) {
            liveBadge.className = 'badge bg-danger me-2 px-2 py-1';
            liveBadge.innerHTML = '<i class="fa-solid fa-circle-dot fa-fade me-1"></i>LIVE NOW';
        }
        if(heroSubTitle) heroSubTitle.innerText = `${sessionKo} 진행 중`;
    } else if (status === "SEASON_ENDED") {
        if(liveBadge) {
            liveBadge.className = 'badge bg-dark border border-secondary me-2 px-2 py-1';
            liveBadge.innerHTML = '<i class="fa-solid fa-flag-checkered me-1"></i>SEASON ENDED';
        }
        if(heroSubTitle) heroSubTitle.innerText = "지난 시즌 결과";
    } else {
        if(liveBadge) {
            liveBadge.className = 'badge bg-secondary me-2 px-2 py-1'; 
            liveBadge.innerHTML = '<i class="fa-regular fa-calendar me-1"></i>UPCOMING';
        }
        if(heroSubTitle) heroSubTitle.innerText = `다음 일정: ${sessionKo}`;
    }

    // "United States Grand Prix" → 위: UNITED STATES / 아래: GRAND PRIX (첫 단어만 쓰면 'UNITED GRAND PRIX'가 됨)
    const placeName = session.gpName.replace(/\s*Grand Prix\s*$/i, '').trim() || session.gpName;
    const topElem = document.getElementById('hero-title-top');
    const bottomElem = document.getElementById('hero-title-bottom');
    
    if(topElem) topElem.innerText = placeName.toUpperCase(); 
    if(bottomElem) bottomElem.innerText = "GRAND PRIX"; 


    if(heroDesc) {
        heroDesc.innerHTML = status === "LIVE"
            ? `지금 <strong>${session.circuitName}</strong>에서 <strong>${sessionKo}</strong>가 펼쳐지고 있습니다.<br>아래 중계 채널에서 실시간으로 시청하세요.`
            : `다가오는 <strong>${formattedKSTDate}</strong>, <br><strong>${session.circuitName}</strong>에서 펼쳐지는 치열한 레이싱을 준비하세요.`;
    }

    if(typeof heroImages !== 'undefined') {
        const bgUrl = heroImages[session.circuitId] || heroImages["default"];
        const mainHero = document.getElementById('main-hero');
        if(mainHero) mainHero.style.backgroundImage = `url('${bgUrl}')`;
    }
}

// ---------- 첫 화면 '다음 그랑프리' 카드: 서킷 사진 · 국기 · 카운트다운 · 주말 일정 ----------
const COUNTRY_CODES = {
    "Australia": "au", "China": "cn", "Japan": "jp", "Bahrain": "bh", "Saudi Arabia": "sa", "USA": "us", "United States": "us",
    "Canada": "ca", "Monaco": "mc", "Spain": "es", "Austria": "at", "UK": "gb", "United Kingdom": "gb", "Belgium": "be",
    "Hungary": "hu", "Netherlands": "nl", "Italy": "it", "Azerbaijan": "az", "Singapore": "sg", "Mexico": "mx",
    "Brazil": "br", "Qatar": "qa", "UAE": "ae", "United Arab Emirates": "ae", "Malaysia": "my", "Portugal": "pt", "Turkey": "tr"
};
let gpCountdownTimer = null;

function renderGpCard(session, status, weekend) {
    const body = document.getElementById('gp-card-body');
    const card = document.getElementById('gp-card');
    if (!body || !session) return;

    if (card && typeof heroImages !== 'undefined' && !card.querySelector('.gp-card-bg')) {
        const bg = heroImages[session.circuitId] || heroImages["default"];
        card.insertAdjacentHTML('afterbegin', `<div class="gp-card-bg" style="background-image: url('${bg}')"></div>`);
    }

    const code = COUNTRY_CODES[session.country];
    const place = session.gpName.replace(/\s*Grand Prix\s*$/i, '').trim();
    const raceSession = weekend.find(s => s.sessionName === "Race") || session;
    const koName = (n) => (sessionNamesKo[n] || n).replace(/\s*\(.*\)$/, '');  // "퀄리파잉 (Qualifying)" → "퀄리파잉"
    const sessionKo = koName(session.sessionName);
    const shortKST = (ms) => {
        const d = new Date(ms + 9 * 3600 * 1000);
        const day = ["일", "월", "화", "수", "목", "금", "토"][d.getUTCDay()];
        return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${day}) ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    };

    const now = Date.now();
    const sessionsHTML = weekend.map(s => {
        const state = now >= s.endUtcMs ? "done" : (s === session ? "next" : "");
        return `<div class="gp-session ${state}"><span>${koName(s.sessionName)}</span><time>${shortKST(s.startUtcMs)}</time></div>`;
    }).join('');

    body.innerHTML = `
        <div class="gp-meta">
            <span class="gp-round">ROUND ${session.round}</span>
            ${code ? `<img class="gp-flag" src="https://flagcdn.com/w40/${code}.png" alt="${session.country}">` : ''}
            <span>${session.locality}, ${session.country}</span>
        </div>
        <div class="gp-name" id="race-name">${place}<span>GRAND PRIX</span></div>
        <div class="gp-circuit"><i class="fa-solid fa-road me-1"></i>${session.circuitName} · 결승 ${shortKST(raceSession.startUtcMs)}</div>
        ${status === "LIVE"
            ? `<div class="gp-live"><i class="fa-solid fa-circle-dot me-2"></i>LIVE · ${sessionKo} 진행 중</div>
               <a class="gp-watch" href="${WATCH_LINKS[0].url}" target="_blank" rel="noopener"><i class="fa-solid fa-tv me-2"></i>${WATCH_LINKS[0].name}에서 시청하기</a>`
            : status === "SEASON_ENDED"
                ? `<div class="gp-live" style="animation:none">시즌 종료</div>`
                : `<div class="gp-count-label">${sessionKo}까지 (한국 시간)</div>
                   <div class="gp-countdown" id="gp-countdown">
                       <div><b data-unit="d">-</b><small>일</small></div><div><b data-unit="h">-</b><small>시간</small></div>
                       <div><b data-unit="m">-</b><small>분</small></div><div><b data-unit="s">-</b><small>초</small></div>
                   </div>`}
        <div class="gp-sessions">${sessionsHTML}</div>`;

    clearInterval(gpCountdownTimer);
    if (status !== "UPCOMING") return;
    const tick = () => {
        const left = Math.max(0, session.startUtcMs - Date.now());
        if (left === 0) { clearInterval(gpCountdownTimer); fetchLiveF1Data(); return; }  // 세션이 시작되면 LIVE로 다시 그림
        const parts = { d: Math.floor(left / 86400000), h: Math.floor(left / 3600000) % 24, m: Math.floor(left / 60000) % 60, s: Math.floor(left / 1000) % 60 };
        document.querySelectorAll('#gp-countdown b').forEach(b => { b.textContent = String(parts[b.dataset.unit]).padStart(2, "0"); });
        const hud = document.getElementById('hud-countdown');
        if (hud) hud.textContent = `${parts.d > 0 ? parts.d + "일 " : ""}${[parts.h, parts.m, parts.s].map(n => String(n).padStart(2, "0")).join(":")}`;
    };
    tick();
    gpCountdownTimer = setInterval(tick, 1000);
}

// ---------- 생중계 시청 링크 ----------
// 국내 중계: 쿠팡플레이(2026 독점 중계, 전 세션 생중계) · F1 TV Pro(2026년부터 한국 서비스, 영어 해설) · F1 공식 라이브 타이밍(무료)
const WATCH_LINKS = [
    { name: "쿠팡플레이", sub: "국내 독점 중계 · 한국어 해설", url: "https://www.coupangplay.com/", icon: "fa-solid fa-tv", main: true },
    { name: "F1 TV", sub: "F1 공식 스트리밍 · 영어", url: "https://f1tv.formula1.com/", icon: "fa-solid fa-play" },
    { name: "라이브 타이밍", sub: "실시간 순위·랩타임 (무료)", url: "https://www.formula1.com/en/timing/f1-live", icon: "fa-solid fa-stopwatch" },
];
const WATCH_SOON_MS = 30 * 60 * 1000;  // 시작 30분 전부터 시청 버튼을 보여 줌 (사전 중계가 먼저 시작함)
let liveRefreshTimer = null;

function watchButtonsHTML(cls = "") {
    return WATCH_LINKS.map(w => `
        <a class="watch-btn ${w.main ? "main" : ""} ${cls}" href="${w.url}" target="_blank" rel="noopener">
            <i class="${w.icon}"></i><span><b>${w.name}</b><small>${w.sub}</small></span>
            <i class="fa-solid fa-arrow-up-right-from-square ext"></i>
        </a>`).join('');
}

function renderWatch(session, status) {
    const box = document.getElementById('hero-watch');
    if (!box) return;
    const left = session.startUtcMs - Date.now();
    const soon = status === "UPCOMING" && left <= WATCH_SOON_MS;
    clearTimeout(liveRefreshTimer);
    if (status === "LIVE") {
        // 세션이 끝나면 다음 일정으로 다시 그림
        liveRefreshTimer = setTimeout(fetchLiveF1Data, Math.max(5000, session.endUtcMs - Date.now() + 1000));
    } else if (status === "UPCOMING" && !soon) {
        // 시작 30분 전이 되면 시청 버튼이 나오도록 다시 그림 (setTimeout 최대치보다 멀면 생략)
        if (left - WATCH_SOON_MS < 2 ** 31 - 1) liveRefreshTimer = setTimeout(fetchLiveF1Data, left - WATCH_SOON_MS + 1000);
    }
    if (status !== "LIVE" && !soon) { box.innerHTML = ""; return; }

    const koName = (sessionNamesKo[session.sessionName] || session.sessionName).replace(/\s*\(.*\)$/, '');
    box.innerHTML = `
        <div class="watch-head ${status === "LIVE" ? "is-live" : ""}">
            ${status === "LIVE"
                ? `<span class="watch-live-dot"></span><b>LIVE</b> ${session.gpName} · ${koName} 생중계 중`
                : `<i class="fa-regular fa-clock me-2"></i><b>곧 시작</b> ${koName} · 지금 중계 채널에 들어가 보세요`}
        </div>
        <div class="watch-buttons">${watchButtonsHTML()}</div>`;
}

// ---------- 히어로 텔레메트리 HUD: 시즌 진행 · 다음 세션까지 · 서킷 날씨 · 챔피언십 1위 ----------
// 날씨: Open-Meteo (무료·키 없음) — 서킷 좌표의 현재 날씨와 현지 시각
const WEATHER_KO = [
    [[0], "맑음", "fa-sun"], [[1, 2], "구름 조금", "fa-cloud-sun"], [[3], "흐림", "fa-cloud"], [[45, 48], "안개", "fa-smog"],
    [[51, 53, 55, 56, 57], "이슬비", "fa-cloud-rain"], [[61, 63, 65, 66, 67, 80, 81, 82], "비", "fa-cloud-showers-heavy"],
    [[71, 73, 75, 77, 85, 86], "눈", "fa-snowflake"], [[95, 96, 99], "뇌우", "fa-cloud-bolt"],
];

function renderHeroHud(session, status, doneRaces, totalRaces) {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const code = COUNTRY_CODES[session.country];
    set('hero-round', `${code ? `<img src="https://flagcdn.com/w40/${code}.png" alt="">` : ''}ROUND ${session.round} / ${totalRaces}`);

    set('hud-season', `${doneRaces}<small class="text-white-50 fw-normal" style="font-size: 0.8rem;">/ ${totalRaces} 경기 완료</small>`);
    const bar = document.getElementById('hud-season-bar');
    if (bar) requestAnimationFrame(() => { bar.style.width = `${doneRaces / totalRaces * 100}%`; });

    const koName = (sessionNamesKo[session.sessionName] || session.sessionName).replace(/\s*\(.*\)$/, '');
    if (status === "LIVE") {
        set('hud-countdown-label', '지금');
        set('hud-countdown', `<span class="hud-live px-1"><i class="fa-solid fa-circle-dot me-1"></i>LIVE</span>`);
    } else if (status === "SEASON_ENDED") {
        set('hud-countdown', '시즌 종료');
    } else {
        set('hud-countdown-label', `${koName}까지`);
    }
    set('hud-countdown-sub', `${session.locality} · ${koName}`);

    if (session.lat && session.long) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${session.lat}&longitude=${session.long}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)
            .then(res => res.json())
            .then(w => {
                const c = w.current;
                const [, label, icon] = WEATHER_KO.find(([codes]) => codes.includes(c.weather_code)) || [[], "-", "fa-cloud"];
                set('hud-weather', `<i class="fa-solid ${icon} text-warning" style="font-size: 1.1rem;"></i>${Math.round(c.temperature_2m)}°C <small class="text-white-50 fw-normal" style="font-size: 0.8rem;">${label}</small>`);
                const localTime = () => {
                    const d = new Date(Date.now() + w.utc_offset_seconds * 1000);
                    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
                };
                const sub = () => set('hud-weather-sub', `${session.locality} 현지 ${localTime()} · 바람 ${Math.round(c.wind_speed_10m)}km/h`);
                sub();
                setInterval(sub, 30000);
            })
            .catch(() => set('hud-weather-sub', '날씨 정보를 불러오지 못했습니다'));
    }
}

async function fetchStandingsData() {
    const cacheBuster = `?limit=100&t=${new Date().getTime()}`;
    try {
        const dRes = await fetch(`${JOLPICA_BASE_URL}/2026/driverStandings.json${cacheBuster}`);
        const dData = await dRes.json();
        const standings = dData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        
        // 첫 화면 '드라이버 챔피언십' 카드: 1위 드라이버(사진·번호·점수) + 2~5위
        const dList = document.getElementById('driver-list');
        if (dList && standings.length > 0) {
            const teamOf = (d) => teamData[getCleanTeamName(d.Constructors[0].name)] || teamData["default"];
            // 번호는 F1 공식 등번호 이미지, 이미지가 없거나 깨지면 팀 색 숫자
            const numberImg = (d, cls = "") => {
                const num = d.Driver.permanentNumber || "-";
                const url = getNumberImageUrl(d.Driver.driverId);
                return url
                    ? `<img src="${url}" alt="${num}" class="${cls}" referrerpolicy="no-referrer" onerror="this.replaceWith(document.createTextNode('${num}'))">`
                    : num;
            };
            const leader = standings[0];
            const leaderTeam = teamOf(leader);
            const gap = standings[1] ? Number(leader.points) - Number(standings[1].points) : 0;
            const maxPts = Number(leader.points) || 1;

            const card = document.getElementById('driver-card');
            if (card) {
                card.style.setProperty('--team-color', leaderTeam.color);
                const photo = driverImages[leader.Driver.driverId];
                if (photo && !card.querySelector('.driver-photo')) {
                    card.insertAdjacentHTML('afterbegin', `<img class="driver-photo" src="${photo}" alt="${leader.Driver.familyName}" onerror="this.remove()">`);
                }
            }

            const hudLeader = document.getElementById('hud-leader');
            if (hudLeader) {
                hudLeader.innerHTML = `<span style="color: ${leaderTeam.color};">${numberImg(leader)}</span>${leader.Driver.familyName.toUpperCase()}`;
                document.getElementById('hud-leader-sub').innerHTML = `<b class="text-white">${leader.points}점</b> · 2위와 ${gap}점 차`;
            }

            dList.innerHTML = `
                <div class="driver-leader">
                    <span class="leader-badge"><i class="fa-solid fa-crown me-1"></i>1위</span>
                    <span class="number">${numberImg(leader, "h-100")}</span>
                    <div class="given">${leader.Driver.givenName}</div>
                    <div class="family">${leader.Driver.familyName}</div>
                    <div class="team">${leader.Constructors[0].name}</div>
                    <div class="pts">${leader.points}<small>점</small></div>
                    ${gap > 0 ? `<div class="gap">2위와 <b class="text-white">${gap}점</b> 차</div>` : ''}
                </div>
                <div class="driver-rows">
                    ${standings.slice(1, 5).map((d, i) => {
                        const t = teamOf(d);
                        return `
                            <div class="driver-row">
                                <span class="rank">${i + 2}위</span>
                                <span class="num" style="color: ${t.color};">${numberImg(d)}</span>
                                <span class="name text-truncate">${d.Driver.familyName}</span>
                                <span class="bar"><i style="--w: ${Number(d.points) / maxPts * 100}%; background: ${t.color}; animation-delay: ${0.3 + i * 0.08}s;"></i></span>
                                <span class="p">${d.points}</span>
                            </div>`;
                    }).join('')}
                </div>`;
        }

        const cRes = await fetch(`${JOLPICA_BASE_URL}/2026/constructorStandings.json${cacheBuster}`);
        const cData = await cRes.json();
        const constructors = cData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
        
        // 첫 화면 '컨스트럭터 챔피언십' 카드: 1위 팀(로고·점수·차량) + TOP 5 막대그래프
        const topTeamElem = document.getElementById('top-team');
        if (topTeamElem && constructors.length > 0) {
            const teamOf = (c) => teamData[getCleanTeamName(c.Constructor.name)] || teamData["default"];
            const leader = constructors[0];
            const leaderName = getCleanTeamName(leader.Constructor.name);
            const leaderInfo = teamOf(leader);
            const car = (teamAssets[leaderName] || {}).car;
            const gap = constructors[1] ? Number(leader.points) - Number(constructors[1].points) : 0;
            const maxPts = Number(leader.points) || 1;

            const card = document.getElementById('constructor-card');
            if (card) {
                card.style.setProperty('--team-color', leaderInfo.color);
                if (leaderInfo.logo) card.insertAdjacentHTML('afterbegin', `<img class="constructor-watermark" src="${leaderInfo.logo}" alt="" aria-hidden="true">`);
            }

            topTeamElem.innerHTML = `
                <div class="constructor-leader">
                    ${leaderInfo.logo ? `<img class="leader-logo" src="${leaderInfo.logo}" alt="${leader.Constructor.name}" onerror="this.remove()">` : ''}
                    <div class="flex-grow-1 min-w-0">
                        <span class="leader-badge"><i class="fa-solid fa-crown me-1"></i>1위</span>
                        <div class="leader-name text-truncate">${leader.Constructor.name}</div>
                    </div>
                    <div class="text-end">
                        <div class="constructor-points">${leader.points}<small>점</small></div>
                        ${gap > 0 ? `<div class="constructor-gap">2위와 <b class="text-white">${gap}점</b> 차</div>` : ''}
                    </div>
                </div>
                ${car ? `<img class="constructor-car" src="${car}" alt="${leader.Constructor.name} 차량" referrerpolicy="no-referrer" onerror="this.remove()">` : '<div class="mb-3"></div>'}
                <div class="constructor-bars">
                    ${constructors.slice(0, 5).map((c, i) => {
                        const info = teamOf(c);
                        return `
                            <div class="constructor-bar">
                                <span class="rank">${i + 1}</span>
                                <span class="name">${getCleanTeamName(c.Constructor.name)}</span>
                                <span class="track"><span class="fill d-block" style="--w: ${Math.max(4, Number(c.points) / maxPts * 100)}%; background: ${info.color}; color: ${info.color}; animation-delay: ${0.25 + i * 0.08}s;"></span></span>
                                <span class="pts">${c.points}</span>
                            </div>`;
                    }).join('')}
                </div>`;
        }

    } catch (error) { console.error('순위 데이터 로드 에러:', error); }
}

// 메인 화면 '최신 뉴스'(Motorsport.com 4개) · '경기 리포트'(위키백과 4개) · '최신 하이라이트'(F1 유튜브 4개) — news.html과 같은 data/news.json
async function fetchRealNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = '<div class="text-center text-white-50 mt-4"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i><br><small>뉴스 불러오는 중...</small></div>';
    try {
        const data = await loadNewsData();
        const items = (data.tabs.latest && data.tabs.latest.items || []).slice(0, 4);
        if (items.length === 0) throw new Error("기사 없음");
        newsContainer.innerHTML = items.map(news => `
            <a class="news-card mb-2 d-block text-decoration-none" href="article.html?tab=latest&id=${news.id}">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge border border-secondary text-white-50">${escapeHtml(data.tabs.latest.source)}</span>
                    <small class="text-danger fw-bold">${timeAgo(news.date)}</small>
                </div>
                <h6 class="m-0 fw-bold text-white mt-1" style="line-height: 1.3; font-size: 0.9rem;">${escapeHtml(news.titleKo || news.title)}</h6>
            </a>`).join('');
        renderHomeReports(data);
        renderHomeVideos(data);
    } catch (error) {
        newsContainer.innerHTML = '<p class="text-white-50 small mt-3">뉴스를 불러오지 못했습니다. <a href="news.html" class="text-danger">뉴스 페이지</a>에서 다시 확인해 주세요.</p>';
        renderHomeReports({ tabs: {} });  // 경기 리포트·하이라이트 칸에도 안내 문구
        renderHomeVideos({ tabs: {} });
    }
}

function renderHomeReports(data) {
    const box = document.getElementById('home-reports');
    if (!box) return;
    const reports = (data.tabs.report && data.tabs.report.items || []).slice(0, 4);
    if (reports.length === 0) {
        box.innerHTML = '<p class="text-white-50 small mt-3">경기 리포트를 불러오지 못했습니다.</p>';
        return;
    }
    box.innerHTML = reports.map(r => {
        const race = new Date(r.raceDate);
        return `
            <a class="news-card d-flex gap-3 align-items-center text-decoration-none" href="article.html?tab=report&id=${r.id}">
                <img src="${escapeHtml(r.image || 'img/favicon.svg')}" alt="" loading="lazy"
                     style="width: 84px; aspect-ratio: 4 / 3; object-fit: contain; background: #f2f2f4; border-radius: 6px; padding: 4px; flex-shrink: 0;">
                <div class="min-w-0">
                    <small class="text-danger fw-bold">${race.getMonth() + 1}월 ${race.getDate()}일 경기</small>
                    <h6 class="m-0 fw-bold text-white mt-1" style="line-height: 1.3; font-size: 0.95rem;">${escapeHtml(r.titleKo || r.title)}</h6>
                    <small class="text-white-50">전문 번역 · 수정 ${timeAgo(r.date)}</small>
                </div>
            </a>`;
    }).join('');
}

function renderHomeVideos(data) {
    const box = document.getElementById('home-videos');
    if (!box) return;
    const videos = (data.tabs.video && data.tabs.video.items || []).slice(0, 4);
    if (videos.length === 0) {
        box.innerHTML = '<p class="text-white-50 small mt-3">영상을 불러오지 못했습니다.</p>';
        return;
    }
    box.innerHTML = videos.map(v => `
        <a class="home-video text-decoration-none" href="article.html?tab=video&id=${v.id}">
            <div class="home-video-thumb">
                <img src="${escapeHtml(v.image)}" alt="" loading="lazy">
                <i class="fa-solid fa-circle-play"></i>
            </div>
            <div class="min-w-0">
                <h6 class="m-0 fw-bold text-white" style="line-height: 1.35; font-size: 0.92rem;">${escapeHtml(v.titleKo || v.title)}</h6>
                <small class="text-white-50">${timeAgo(v.date)} · FORMULA 1</small>
            </div>
        </a>`).join('');
}
