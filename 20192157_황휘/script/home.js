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

            const addSession = (sessionName, date, time) => {
                if (!date || !time) return;
                const timeStr = time.endsWith('Z') ? time : `${time}Z`;
                const startUtcMs = new Date(`${date}T${timeStr}`).getTime();
                
                let durationMs = 60 * 60 * 1000;
                if (sessionName === "Race") durationMs = 1.5 * 60 * 60 * 1000; 
                const endUtcMs = startUtcMs + durationMs;

                allSessions.push({
                    gpName, circuitName, circuitId, sessionName, startUtcMs, endUtcMs, dateString: date
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

    } catch (error) {
        console.error('일정 데이터 호출 실패:', error);
    }
    fetchStandingsData();
}

function updateHeroUI(session, status) {
    const liveBadge = document.getElementById('live-badge');
    const heroSubTitle = document.getElementById('hero-sub-title');
    const raceNameElem = document.getElementById('race-name');
    const raceDateElem = document.getElementById('race-date');
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

    if(raceNameElem) raceNameElem.innerText = session.gpName.toUpperCase(); 

    if(heroDesc) {
        heroDesc.innerHTML = `다가오는 <strong>${formattedKSTDate}</strong>, <br><strong>${session.circuitName}</strong>에서 펼쳐지는 치열한 레이싱을 준비하세요.`;
    }

    if(raceDateElem) {
        raceDateElem.innerHTML = `
            <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">${formattedKSTDate}</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9em;">${sessionKo} | ${session.circuitName}</div>
        `;
    }
    
    if(typeof heroImages !== 'undefined') {
        const bgUrl = heroImages[session.circuitId] || heroImages["default"];
        const mainHero = document.getElementById('main-hero');
        if(mainHero) mainHero.style.backgroundImage = `url('${bgUrl}')`;
    }
}

async function fetchStandingsData() {
    const cacheBuster = `?limit=100&t=${new Date().getTime()}`;
    try {
        const dRes = await fetch(`${JOLPICA_BASE_URL}/2026/driverStandings.json${cacheBuster}`);
        const dData = await dRes.json();
        const standings = dData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        
        const d1 = document.getElementById('driver-1');
        const d2 = document.getElementById('driver-2');
        if(d1 && standings.length > 0) d1.innerText = `${standings[0].Driver.familyName} (${standings[0].points}점)`;
        if(d2 && standings.length > 1) d2.innerText = `${standings[1].Driver.familyName} (${standings[1].points}점)`;

        const dContainer = document.getElementById('detailed-drivers');
        if(dContainer && standings.length > 0) {
            dContainer.innerHTML = '';
            standings.slice(0, 5).forEach((d, i) => {
                const cleanName = getCleanTeamName(d.Constructors[0].name);
                const tInfo = teamData[cleanName] || teamData["default"];
                dContainer.insertAdjacentHTML('beforeend', `
                    <div class="dashboard-list-item d-flex align-items-center mb-2">
                        <span class="text-white-50 fw-bold me-3 text-center" style="width: 20px;">${i + 1}</span>
                        <div class="team-color-bar" style="height: 30px; background-color: ${tInfo.color}; width: 4px;"></div>
                        <div class="driver-number me-3 text-center" style="color: ${tInfo.color}; font-weight: 900; font-style: italic; width: 25px;">${d.Driver.permanentNumber || "-"}</div>
                        <div class="flex-grow-1 pe-2">
                            <h6 class="m-0 fw-bold text-white">${d.Driver.givenName} <span class="text-uppercase">${d.Driver.familyName}</span></h6>
                            <small class="text-white-50" style="font-size: 0.75rem;">${d.Constructors[0].name}</small>
                        </div>
                        <div class="d-flex align-items-center justify-content-end text-nowrap">
                            <h5 class="m-0 fw-black text-danger me-1">${d.points}</h5>
                            <span class="text-white-50 fw-normal" style="font-size: 0.75rem;">점</span>
                        </div>
                    </div>
                `);
            });
        }

        const cRes = await fetch(`${JOLPICA_BASE_URL}/2026/constructorStandings.json${cacheBuster}`);
        const cData = await cRes.json();
        const constructors = cData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
        
        const topTeamElem = document.getElementById('top-team');
        if(topTeamElem && constructors.length > 0) {
            const topConstructor = constructors[0];
            const cleanTopName = getCleanTeamName(topConstructor.Constructor.name);
            const topInfo = teamData[cleanTopName] || teamData["default"];
            const logoHTML = topInfo.logo ? `<img src="${topInfo.logo}" alt="logo" style="height: 24px; margin-right: 8px; object-fit: contain; vertical-align: middle;">` : '';
            
            topTeamElem.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    ${logoHTML}
                    <span style="font-weight: 900; font-size: 1.1rem; color: #fff; text-transform: uppercase;">${topConstructor.Constructor.name}</span>
                </div>
                <div style="font-weight: 800; font-size: 1.2rem; color: #dc3545;">
                    ${topConstructor.points} <span style="font-weight: 400; font-size: 0.8rem; color: rgba(255,255,255,0.5);">점</span>
                </div>
            `;
        }

        const cContainer = document.getElementById('detailed-constructors');
        if(cContainer && constructors.length > 0) {
            cContainer.innerHTML = '';
            constructors.slice(0, 5).forEach((c, i) => {
                const cleanName = getCleanTeamName(c.Constructor.name);
                const tInfo = teamData[cleanName] || teamData["default"];
                const logoHTML = tInfo.logo ? `<img src="${tInfo.logo}" alt="logo" style="height: 18px; max-width: 50px; object-fit: contain;" onerror="this.style.display='none'">` : '';
                cContainer.insertAdjacentHTML('beforeend', `
                    <div class="dashboard-list-item d-flex align-items-center mb-2">
                        <span class="text-white-50 fw-bold me-3 text-center" style="width: 20px;">${i + 1}</span>
                        <div class="team-color-bar" style="height: 30px; background-color: ${tInfo.color}; width: 4px;"></div>
                        <div class="flex-grow-1 pe-2 d-flex flex-column">
                            <h6 class="m-0 fw-bold text-white">${c.Constructor.name}</h6>
                            <div class="mt-0">${logoHTML}</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-end text-nowrap">
                            <h5 class="m-0 fw-black text-danger me-1">${c.points}</h5>
                            <span class="text-white-50 fw-normal" style="font-size: 0.75rem;">점</span>
                        </div>
                    </div>
                `);
            });
        }
    } catch (error) { console.error('순위 데이터 로드 에러:', error); }
}

async function translateText(text) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        return (data && data[0] && data[0][0]) ? data[0].map(item => item[0]).join('') : text;
    } catch (error) { return text; }
}

async function fetchRealNews() {
    const newsContainer = document.getElementById('news-container');
    if(!newsContainer) return;

    const cachedNews = localStorage.getItem('f1_news_cache');
    const cachedTime = localStorage.getItem('f1_news_time');
    const now = new Date().getTime();

    if (cachedNews && cachedTime && (now - cachedTime < 600000)) {
        newsContainer.innerHTML = cachedNews;
        return;
    }

    newsContainer.innerHTML = '<div class="text-center text-white-50 mt-4"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i><br><small>뉴스 번역 중...</small></div>';
    
    try {
        const rssUrl = 'https://www.motorsport.com/rss/f1/news/';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(apiUrl);
        if (response.status === 403) throw new Error("API Limit Reached");

        const data = await response.json();
        if (data.status === 'ok') {
            newsContainer.innerHTML = '';
            const topNews = data.items.slice(0, 4);
            const translatedTitles = await Promise.all(topNews.map(news => translateText(news.title)));
            
            let htmlContent = '';
            topNews.forEach((news, index) => {
                const dateStr = new Date(news.pubDate).toISOString().split('T')[0];
                htmlContent += `
                    <div class="news-card mb-2" onclick="window.open('${news.link}', '_blank')">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge border border-secondary text-white-50">뉴스</span>
                            <small class="text-danger fw-bold">${dateStr}</small>
                        </div>
                        <h6 class="m-0 fw-bold text-white mt-1" style="line-height: 1.3; font-size: 0.9rem;">${translatedTitles[index]}</h6>
                    </div>
                `;
            });

            newsContainer.innerHTML = htmlContent;
            localStorage.setItem('f1_news_cache', htmlContent);
            localStorage.setItem('f1_news_time', now.toString());
        }
    } catch (error) { renderMockNews(); }
}

function renderMockNews() {
    const mockNews = [
        { title: "아우디 F1 공식 데뷔 준비 완료", date: "1시간 전", category: "팀" },
        { title: "페라리 해밀턴-르클레르 듀오 기대감 고조", date: "3시간 전", category: "드라이버" }
    ];
    const newsContainer = document.getElementById('news-container');
    if(!newsContainer) return;
    let htmlContent = '';
    mockNews.forEach(news => {
        htmlContent += `
            <div class="news-card mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge border border-secondary text-white-50">${news.category}</span>
                    <small class="text-danger fw-bold">${news.date}</small>
                </div>
                <h6 class="m-0 fw-bold text-white mt-1" style="line-height: 1.3; font-size: 0.9rem;">${news.title}</h6>
            </div>
        `;
    });
    newsContainer.innerHTML = htmlContent;
}