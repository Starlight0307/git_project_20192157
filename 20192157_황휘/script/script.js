const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";
let selectedYear = "2026"; 

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();

    if (document.getElementById('race-name')) fetchLiveF1Data();
    if (document.getElementById('news-container')) fetchRealNews(); 

    if (document.getElementById('year-select')) {
        initYearSelector('year-select', (year) => {
            selectedYear = year;
            if(document.getElementById('display-year')) document.getElementById('display-year').innerText = year;
            fetchFullScheduleAndResults(year);
        });
    } else if (document.getElementById('full-schedule-container')) {
        fetchFullScheduleAndResults(selectedYear); 
    }

    if (document.getElementById('year-select-circuit')) {
        initYearSelector('year-select-circuit', (year) => {
            selectedYear = year;
            if(document.getElementById('display-year-circuit')) document.getElementById('display-year-circuit').innerText = year;
            if(typeof renderCircuitGuideData === "function") renderCircuitGuideData(year);
        });
    } else if (document.getElementById('circuit-guide-container')) {
        if(typeof renderCircuitGuideData === "function") renderCircuitGuideData(selectedYear);
    }

    if (document.getElementById('highlights-container')) fetchHighlights();
});

function initYearSelector(elementId, onChangeCallback) {
    const select = document.getElementById(elementId);
    if (!select) return;

    const currentYear = 2026;
    const startYear = 2010; 

    for (let y = currentYear; y >= startYear; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y + " Season";
        if (y.toString() === selectedYear) opt.selected = true;
        select.appendChild(opt);
    }

    select.addEventListener('change', (e) => {
        onChangeCallback(e.target.value);
    });

    onChangeCallback(select.value);
}

async function loadNavbar() {
    try {
        const response = await fetch('navbar.html');
        const navHTML = await response.text();
        const placeholder = document.getElementById('navbar-placeholder');
        if (placeholder) {
            placeholder.innerHTML = navHTML;
        }
        highlightCurrentMenu();
    } catch (error) {
        console.error('메뉴바 로드 실패:', error);
    }
}

function loadFooter() {
    const footerHTML = `
        <footer style="background-color: #111; border-top: 1px solid #333; padding: 20px 0; margin-top: 50px; text-align: center;">
            <div class="container">
                <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    &copy; 2026 <strong>Hwang Hwi</strong>. All Rights Reserved.<br>
                    <span style="font-size: 0.75rem;">This website is unofficial and is not associated in any way with the Formula 1 companies.</span>
                </p>
            </div>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

function highlightCurrentMenu() {
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '') currentPage = 'index.html';

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active', 'text-danger'));

    const activeLink = document.querySelector(`.nav-link[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'text-danger');
    }

    if (currentPage === 'about.html') {
        const aboutMenu = document.querySelector('.nav-about');
        if(aboutMenu) aboutMenu.classList.add('active', 'text-danger');
    }
}

const teamData = {
    "Red Bull": { color: "#3671C6", logo: "https://i.namu.wiki/i/VuzRxdwHtjszTDw67enfN0WUR8qpxfL9sycIx-RpXw3yNAmqlqC3iQ2pqp5uPn4RveoyrWMdXsxei-nx2z0yQ7mWLbuBFvfbKiP4m28lkBTcC-A_z1M5TqkmLMiHdvx_x0BDkHxjzw4X5vzothLDmw.svg" },
    "Ferrari": { color: "#E8002D", logo: "https://i.namu.wiki/i/OeJYB4YhsVJaAQErmESXqS9rru0SgenrWvN58SMN8RXIbSUKGwYpH_zSL-LpeAvPEggIcp_ALJqQXO9IWZ-vKXyG-0Acx9F9wbQSF1xUqAt_8mGDiCxeuKG2k71CQnZlEznEGdWaskN-nk5X_dcd4A.svg" },
    "Mercedes": { color: "#27F4D2", logo: "https://i.namu.wiki/i/cAFI0G8astlt8ldU78dSxMqSC-hcoa4R2-UdEYePRY_Eip_I_a4WR27dv0H0j24amv7UlD9bMtaL1w_bTCk9MzVkwtK-RprflnWUmw-U8ln9S8JPJeLMwv5YH0zUMRfgH7k47oJTYQQ9Jyr5-vRMjg.svg" },
    "McLaren": { color: "#FF8000", logo: "https://i.namu.wiki/i/P7f4aAYQ0fMBtJjn_K_eciEpSXA_v4Zqt63v3sONHwqt-JqUmicL0Uqaly7yW1AanykMSKkkhARiV0ifbZQ_HJcbQlle8AnSY_LjAqd7kklWPkRiQFRp3vkaqwQhw2T6ykuSJsqRXMc0_rNJ4nRjMg.svg" },
    "Aston Martin": { color: "#229971", logo: "https://i.namu.wiki/i/64wXWbB6ejikhh11SpFcv9C--QW1LL4KuBXmCVm1mMM2r2b3GW0eytIRebJCjeTImPbS0mMTNOm0w2Pjj5xCEr2ISxq5qdw0_nPGhuWru22HLONazSPZplIftTx6rIF-oveB_AksWC8KlfYp4CQBjw.svg" },
    "RB": { color: "#ffffff", logo: "https://i.namu.wiki/i/_3iexdOA1CkCXBeS7-zdQA7-pfBSbi1hR-yKz9QWLh0lWE4AbXLXNU_IqCayXau5oqS3J1s3FnfPby2yICtMRh06b5T7MQE8uPjhSeg6xdlSf5ehaoj8iVTv-2TJeWC5D4ixnkn_KH3_Ja86sBXFvA.webp" },
    "Haas": { color: "#E8002D", logo: "https://i.namu.wiki/i/cOmft2_kNvhdlXIgQm4thOyWWay3UhdNF1luXoSrVA-boODEIZPVE2dEjlzbGO5ZQWUqxJdiPMIPL7Z7GC3lSNZ_5lgonqYt4eI1O_6PwUjsfg5_HCrJPBamsx7famt4pXRE7fKyHTvDgevFlle0uA.svg" },
    "Alpine": { color: "#0093CC", logo: "https://i.namu.wiki/i/pqJCD9k2amLoauEt7yrTMSVimxgCbwYYX2mf90e90sSrXZR_tInDQ7cWs9qHedD0vrYu7WZ3J_c0yFjPvRnmhfordF9FAuys9q5ttLNSHRYzZXhYqNnAgLgW5lzrTRYPJ9xH_5rTsjMrrRSmz4hAaQ.svg" },
    "Williams": { color: "#64C4FF", logo: "https://i.namu.wiki/i/EoNfnU7NyWth9Zq6mk8egrGb0LpuWGWnX6Rqnkly2oRtlCbkHWnrGqoET6x34TPqu-E101zyS1ha08Q2hPFcG9hnhcSG3647DlKRSOv4nyj795WvU5iT3cXtpiCt8HdSgHWDpKZO5JgTbsqq8k5MdA.webp" },
    "Audi": { color: "#ffffff", logo: "https://i.namu.wiki/i/d_geXXhwrul5N9T2xPv1yAplW0xYCUtMkpoglQihFnhsIhFqG3Y0EsS_a2rr1n4jrH0W4ia6_CRUYF687GRAK9PHoI7cjw-bVXHENbo5U0jVvzn2Tvq-n7EPA63Yhg4CP7tM6M8FTbavJaSlpxBVCg.svg" },
    "Cadillac": { color: "#ffffff", logo: "https://i.namu.wiki/i/HUsFyPw4oyELhG3JhJDooT2XI1moXA_x4F5wMTCbLbH6sQVUCE1p2qmjJLulQsw5Ey_1A9dPvlb-P6UZ2fsWog.svg" },
    "default": { color: "#FFFFFF", logo: "" }
};

const sessionNamesKo = {
    "Practice 1": "프랙티스 1 (Practice 1)",
    "Practice 2": "프랙티스 2 (Practice 2)",
    "Practice 3": "프랙티스 3 (Practice 3)",
    "Sprint Qualifying": "스프린트 퀄리파잉 (Sprint Qualifying)",
    "Sprint": "스프린트 (Sprint)",
    "Qualifying": "퀄리파잉 (Qualifying)",
    "Race": "레이스 (Race)"
};

function getCleanTeamName(rawName) {
    if (rawName.includes("Red Bull")) return "Red Bull";
    if (rawName.includes("Audi")) return "Audi";
    if (rawName.includes("Cadillac")) return "Cadillac";
    if (rawName.includes("Haas")) return "Haas";
    if (rawName.includes("Alpine")) return "Alpine";
    if (rawName.includes("RB")) return "RB";
    return rawName;
}

function formatKST(timestampUtcMs) {
    const kstTime = new Date(timestampUtcMs + (9 * 60 * 60 * 1000));
    const year = kstTime.getUTCFullYear();
    const month = kstTime.getUTCMonth() + 1;
    const date = kstTime.getUTCDate();
    let hours = kstTime.getUTCHours();
    const minutes = kstTime.getUTCMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${year}년 ${month}월 ${date}일 ${ampm} ${hours}시 ${minutesStr}분`;
}

// ----------------------------------------------------
// 1. 메인 홈페이지 Live 및 순위 기능
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

            if (circuitId === "catalunya" || circuitName.includes("Madri") || race.Circuit.Location.locality === "Madrid") {
                circuitId = "madrid";
                circuitName = "MADRING";
            }

            const addSession = (sessionName, date, time) => {
                if (!date || !time) return;
                
                const timeStr = time.endsWith('Z') ? time : `${time}Z`;
                const startUtcMs = new Date(`${date}T${timeStr}`).getTime();
                
                let durationMs = 60 * 60 * 1000;
                if (sessionName === "Race") {
                    durationMs = 1.5 * 60 * 60 * 1000; 
                }
                
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
        if(heroSubTitle) heroSubTitle.innerText = "PREVIOUS ROUND";
    } else {
        if(liveBadge) {
            liveBadge.className = 'badge bg-secondary me-2 px-2 py-1';
            liveBadge.innerHTML = '<i class="fa-regular fa-calendar me-1"></i>UPCOMING';
        }
        if(heroSubTitle) heroSubTitle.innerText = `다음 일정: ${sessionKo}`;
    }

    const words = session.gpName.split(' ');
    const topElem = document.getElementById('hero-title-top');
    const bottomElem = document.getElementById('hero-title-bottom');
    if(topElem) topElem.innerText = words[0]; 
    if(bottomElem) bottomElem.innerText = words.slice(1).join(' ');

    if(raceNameElem) raceNameElem.innerText = session.gpName;
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
    // 🔥 데이터가 30개 이상일 경우 잘리지 않도록 ?limit=100 강제 적용
    const cacheBuster = `?limit=100&t=${new Date().getTime()}`;
    try {
        const dRes = await fetch(`${JOLPICA_BASE_URL}/2026/driverStandings.json${cacheBuster}`);
        const dData = await dRes.json();
        const standings = dData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        
        const d1 = document.getElementById('driver-1');
        const d2 = document.getElementById('driver-2');
        if(d1) d1.innerText = `${standings[0].Driver.familyName} (${standings[0].points}pts)`;
        if(d2) d2.innerText = `${standings[1].Driver.familyName} (${standings[1].points}pts)`;

        const dContainer = document.getElementById('detailed-drivers');
        if(dContainer) {
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
                            <span class="text-white-50 fw-normal" style="font-size: 0.75rem;">PTS</span>
                        </div>
                    </div>
                `);
            });
        }

        const cRes = await fetch(`${JOLPICA_BASE_URL}/2026/constructorStandings.json${cacheBuster}`);
        const cData = await cRes.json();
        const constructors = cData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        
        const topTeamElem = document.getElementById('top-team');
        if(topTeamElem) {
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
                    ${topConstructor.points} <span style="font-weight: 400; font-size: 0.8rem; color: rgba(255,255,255,0.5);">PTS</span>
                </div>
            `;
        }

        const cContainer = document.getElementById('detailed-constructors');
        if(cContainer) {
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
                            <span class="text-white-50 fw-normal" style="font-size: 0.75rem;">PTS</span>
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
                    <div class="news-card" onclick="window.open('${news.link}', '_blank')">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge border border-secondary text-white-50">NEWS</span>
                            <small class="text-danger fw-bold">${dateStr}</small>
                        </div>
                        <h6 class="m-0 fw-bold text-white mt-2" style="line-height: 1.4;">${translatedTitles[index]}</h6>
                    </div>
                `;
            });

            newsContainer.innerHTML = htmlContent;
            localStorage.setItem('f1_news_cache', htmlContent);
            localStorage.setItem('f1_news_time', now.toString());
        }
    } catch (error) { 
        if (cachedNews) {
            newsContainer.innerHTML = cachedNews;
        } else {
            renderMockNews(); 
        }
    }
}

function renderMockNews() {
    const mockNews = [
        { title: "아우디(Audi) F1 공식 데뷔! 2026 시즌 첫 하이브리드 머신 공개", date: "1시간 전", category: "TEAM" },
        { title: "페라리의 해밀턴 & 르클레르, 역대 최강 듀오의 첫 그랑프리 전망 분석", date: "3시간 전", category: "DRIVER" },
        { title: "11번째 팀 '캐딜락(Cadillac)' 합류 확정, 그리드 판도 어떻게 바뀔까?", date: "5시간 전", category: "NEWS" },
        { title: "2026 엔진 규정 대폭 변경, 각 팀의 에어로다이내믹 전략 파헤치기", date: "1일 전", category: "TECH" }
    ];
    const newsContainer = document.getElementById('news-container');
    if(!newsContainer) return;
    let htmlContent = '';
    mockNews.forEach(news => {
        htmlContent += `
            <div class="news-card">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge border border-secondary text-white-50">${news.category}</span>
                    <small class="text-danger fw-bold">${news.date}</small>
                </div>
                <h6 class="m-0 fw-bold text-white mt-2" style="line-height: 1.4;">${news.title}</h6>
            </div>
        `;
    });
    newsContainer.innerHTML = htmlContent;
}

// ----------------------------------------------------
// 3. 서브 페이지: 일정/결과 동적 로드 (schedule.html)
// ----------------------------------------------------
async function fetchFullScheduleAndResults(year) {
    const container = document.getElementById('full-schedule-container');
    if (!container) return;
    
    container.innerHTML = '<div class="col-12 text-center text-white-50 py-5"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i><p>데이터를 불러오는 중...</p></div>';
    
    try {
        // 🔥 핵심 수정: limit=100 및 limit=1000을 추가하여 3라운드 이후 데이터가 끊기지 않게 완벽하게 가져옵니다.
        const [scheduleRes, resultsRes] = await Promise.all([
            fetch(`${JOLPICA_BASE_URL}/${year}.json?limit=100`),
            fetch(`${JOLPICA_BASE_URL}/${year}/results.json?limit=1000`)
        ]);
        
        const scheduleData = await scheduleRes.json();
        const resultsData = await resultsRes.json();
        
        const races = scheduleData.MRData.RaceTable.Races;
        const resultRaces = resultsData.MRData.RaceTable.Races;
        
        container.innerHTML = '';
        
        races.forEach(race => {
            const matchedResult = resultRaces.find(r => r.round === race.round);
            let podiumHTML = '<span class="text-white-50 fst-italic">경기 예정</span>';
            
            if (matchedResult && matchedResult.Results && matchedResult.Results.length >= 3) {
                podiumHTML = `
                    <div class="d-flex gap-3 text-white">
                        <span>🏆 ${matchedResult.Results[0].Driver.familyName}</span>
                        <span>🥈 ${matchedResult.Results[1].Driver.familyName}</span>
                        <span>🥉 ${matchedResult.Results[2].Driver.familyName}</span>
                    </div>
                `;
            }
            
            let cId = race.Circuit.circuitId;
            let cName = race.Circuit.circuitName;
            
            if (year === "2026" && (cId === "catalunya" || cName.includes("Madri") || race.Circuit.Location.locality === "Madrid")) {
                cId = "madrid";
                cName = "MADRING";
            }

            const timeStr = race.time ? (race.time.endsWith('Z') ? race.time : `${race.time}Z`) : "00:00:00Z";
            const startUtcMs = new Date(`${race.date}T${timeStr}`).getTime();
            const formattedDate = formatKST(startUtcMs);
            const bgUrl = typeof heroImages !== 'undefined' ? (heroImages[cId] || heroImages["default"]) : "";
            
            container.insertAdjacentHTML('beforeend', `
                <div class="col-12 mb-3">
                    <div class="glass-card d-flex flex-column flex-md-row align-items-md-center overflow-hidden" style="background: rgba(30, 30, 35, 0.8);">
                        <div style="width: 100%; max-width: 250px; height: 120px; background: url('${bgUrl}') center/cover;"></div>
                        <div class="p-4 flex-grow-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div>
                                <span class="badge bg-danger mb-2">ROUND ${race.round}</span>
                                <h4 class="fw-bold text-white m-0">${race.raceName}</h4>
                                <p class="text-white-50 m-0 mt-1">${formattedDate} | ${cName}</p>
                            </div>
                            <div class="text-md-end mt-3 mt-md-0 p-3 rounded" style="background: rgba(0,0,0,0.3); border-left: 2px solid #e10600;">
                                <small class="text-danger fw-bold d-block mb-2">RESULTS</small>
                                ${podiumHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    } catch (error) { 
        container.innerHTML = '<div class="col-12 text-center text-danger">일정/결과 데이터를 불러오는 데 실패했습니다.</div>'; 
    }
}

async function fetchHighlights() {
    const container = document.getElementById('highlights-container');
    if (!container) return;

    const mockHighlights = [
        { round: 5, title: "2026 Miami Grand Prix Highlights", thumb: "https://img.youtube.com/vi/aZ3M5B81W1Q/maxresdefault.jpg", link: "https://www.youtube.com/user/Formula1" },
        { round: 4, title: "2026 Japanese Grand Prix Highlights", thumb: "https://img.youtube.com/vi/6tS3aJj0y7E/maxresdefault.jpg", link: "https://www.youtube.com/user/Formula1" },
        { round: 3, title: "2026 Australian Grand Prix Highlights", thumb: "https://img.youtube.com/vi/0pQ3U6tX8c0/maxresdefault.jpg", link: "https://www.youtube.com/user/Formula1" },
        { round: 2, title: "2026 Saudi Arabian Grand Prix Highlights", thumb: "https://img.youtube.com/vi/qQkSjE7t_bQ/maxresdefault.jpg", link: "https://www.youtube.com/user/Formula1" },
        { round: 1, title: "2026 Bahrain Grand Prix Highlights", thumb: "https://img.youtube.com/vi/1_8y2J_5n98/maxresdefault.jpg", link: "https://www.youtube.com/user/Formula1" }
    ];

    container.innerHTML = '';

    mockHighlights.forEach(video => {
        container.insertAdjacentHTML('beforeend', `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="glass-card overflow-hidden h-100" style="background: rgba(30, 30, 35, 0.8); cursor: pointer;" onclick="window.open('${video.link}', '_blank')">
                    <div class="position-relative">
                        <img src="${video.thumb}" alt="Thumbnail" class="w-100" style="height: 200px; object-fit: cover;" onerror="this.src='https://cdn.discordapp.com/attachments/1106925005348032535/1500569885707731035/2180267.jpg?ex=69f8ea1b&is=69f7989b&hm=1e033941559c1a55460b5b4054e608765de4c4dc538d1ba7089739c726acc2d1&'">
                        <div class="position-absolute top-50 start-50 translate-middle">
                            <i class="fa-brands fa-youtube text-danger" style="font-size: 4rem; opacity: 0.9; text-shadow: 0 0 10px rgba(0,0,0,0.5);"></i>
                        </div>
                    </div>
                    <div class="p-4">
                        <span class="badge bg-danger mb-2">ROUND ${video.round}</span>
                        <h5 class="fw-bold text-white m-0" style="line-height: 1.4;">${video.title}</h5>
                    </div>
                </div>
            </div>
        `);
    });
}