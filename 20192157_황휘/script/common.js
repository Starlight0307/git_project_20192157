const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";

// 시즌 포디움(1~3위) 결과 목록
// results.json은 API가 한 번에 100줄까지만 주어서(경기당 약 22줄 → 4~5경기분) 시즌 전체를 셀 수 없다.
// 1·2·3위만 따로 받으면 경기 수만큼만 오므로 시즌 전체를 한 번에 받을 수 있다.
// 각 팀의 지금 정규 드라이버 = 가장 최근 경기에 나온 드라이버 { constructorId: [Driver, Driver] }
// (팀별 드라이버 목록 API에는 연습 주행만 나온 드라이버와 대체 출전 드라이버까지 섞여 있어서,
//  예전처럼 앞에서 2명을 고르면 2026 레드불의 베르스타펜이 빠지고 로슨이 들어갔음)
async function fetchCurrentLineup(year) {
    try {
        const res = await fetch(`${JOLPICA_BASE_URL}/${year}/last/results.json`);
        const races = (await res.json()).MRData.RaceTable.Races;
        if (!races || races.length === 0) return null;
        const lineup = {};
        races[0].Results.forEach(r => {
            (lineup[r.Constructor.constructorId] = lineup[r.Constructor.constructorId] || []).push(r.Driver);
        });
        return lineup;
    } catch (e) {
        console.warn('최근 경기 라인업을 불러오지 못했습니다:', e);
        return null;
    }
}

async function fetchSeasonPodiumResults(year) {
    const lists = await Promise.all([1, 2, 3].map(async (pos) => {
        const res = await fetch(`${JOLPICA_BASE_URL}/${year}/results/${pos}.json?limit=100`);
        const data = await res.json();
        return data.MRData.RaceTable.Races.flatMap(race => race.Results);
    }));
    return lists.flat();
}
let selectedYear = "2026"; 

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();

    // 메인 홈페이지 기능 (home.js)
    if (document.getElementById('race-name') && typeof fetchLiveF1Data === "function") fetchLiveF1Data();
    if (document.getElementById('news-container') && typeof fetchRealNews === "function") fetchRealNews(); 

    // 일정/결과 기능 (schedule.js)
    if (document.getElementById('year-select')) {
        initYearSelector('year-select', (year) => {
            selectedYear = year;
            if(document.getElementById('display-year')) document.getElementById('display-year').innerText = year;
            if(typeof fetchFullScheduleAndResults === "function") fetchFullScheduleAndResults(year);
        });
    } else if (document.getElementById('full-schedule-container')) {
        if(typeof fetchFullScheduleAndResults === "function") fetchFullScheduleAndResults(selectedYear); 
    }

    // 서킷 가이드 기능 (circuit.js)
    if (document.getElementById('year-select-circuit')) {
        initYearSelector('year-select-circuit', (year) => {
            selectedYear = year;
            if(document.getElementById('display-year-circuit')) document.getElementById('display-year-circuit').innerText = year;
            if(typeof renderCircuitGuideData === "function") renderCircuitGuideData(year);
        });
    } else if (document.getElementById('circuit-guide-container')) {
        if(typeof renderCircuitGuideData === "function") renderCircuitGuideData(selectedYear);
    }

    // 하이라이트 기능 (highlight.js)
    if (document.getElementById('highlights-container') && typeof fetchHighlights === "function") fetchHighlights();
    window.addEventListener('hashchange', highlightCurrentMenu);
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
        checkLoginStatus();
        
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
    let currentPath = window.location.pathname.split('/').pop();
    if (currentPath === '' || currentPath === '/') currentPath = 'index.html';
    
    let currentSearch = window.location.search;
    let currentHash = window.location.hash;

    // 위쪽 메뉴바 안의 링크만 (페이지 안의 탭 버튼(.nav-link)까지 고르면 대시보드 탭 선택 표시가 지워짐)
    const allLinks = document.querySelectorAll('#navbar-placeholder .nav-link, #navbar-placeholder .dropdown-item');
    
    allLinks.forEach(link => {
        link.classList.remove('active', 'text-danger', 'text-warning');
        link.style.color = '';
        link.style.fontWeight = '';
        
        if (link.innerText.includes('굿즈 샵') || link.innerText.includes('스토어')) {
            link.classList.add('text-warning');
        }
    });

    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        if (href.startsWith('http')) return;
        
        let linkPage = href.split('?')[0].split('#')[0].split('/').pop();
        let linkSearch = href.includes('?') ? '?' + href.split('?')[1].split('#')[0] : '';
        let linkHash = href.includes('#') ? '#' + href.split('#')[1] : '';

        if (linkPage === currentPath) {
            let isMatch = false;

            if (currentPath === 'dashboard.html') {
                if (linkSearch === currentSearch) isMatch = true;
            }
            else if (currentPath === 'shop.html' || currentPath === 'news.html') {
                if (currentHash === '') {
                    if ((currentPath === 'shop.html' && linkHash === '#team') ||
                        (currentPath === 'news.html' && linkHash === '#latest')) {
                        isMatch = true;
                    }
                } else if (linkHash === currentHash) {
                    isMatch = true;
                }
            }
            else {
                if (linkHash === '') isMatch = true;
                else if (linkHash === currentHash) isMatch = true;
            }

            // 정확히 일치하는 메뉴를 찾았다면 색상 부여!
            if (isMatch) {
                const parentDropdown = link.closest('.dropdown');
                const parentNavLink = parentDropdown ? parentDropdown.querySelector('.dropdown-toggle') : null;

                if (currentPath === 'shop.html') {
                    link.classList.remove('text-warning'); 
                    link.style.setProperty('color', '#ffc107', 'important');
                    link.style.setProperty('font-weight', '900', 'important');
                    
                    if (parentNavLink) {
                        parentNavLink.classList.remove('text-danger', 'text-warning');
                        parentNavLink.style.setProperty('color', '#ffc107', 'important');
                        parentNavLink.style.setProperty('font-weight', '900', 'important');
                    }
                }
                else {
                    link.classList.add('active', 'text-danger');
                    if (parentNavLink) {
                        if (parentNavLink.innerText.includes('굿즈 샵')) {
                            parentNavLink.classList.remove('text-danger');
                            parentNavLink.classList.add('text-warning');
                        } else {
                            parentNavLink.classList.add('active', 'text-danger');
                        }
                    }
                }
            }
        }
    });
}

function checkLoginStatus() {
    const dashboardMenus = document.querySelectorAll('#nav-my-dashboard');
    const authBtns = document.querySelectorAll('#nav-auth-btn');
    const isLoggedIn = localStorage.getItem('f1_logged_in') === 'true';

    authBtns.forEach(btn => {
        if (isLoggedIn) {
            btn.innerHTML = '<i class="fa-solid fa-right-from-bracket d-sm-none"></i><span class="d-none d-sm-inline">로그아웃</span>';
            btn.classList.remove('btn-outline-danger');
            btn.classList.add('btn-outline-secondary');
            btn.href = '#'; 
            
            btn.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('f1_logged_in'); 
                alert("로그아웃 처리되었습니다.");
                
                if (window.location.pathname.includes('dashboard')) {
                    window.location.href = 'index.html';
                } else {
                    window.location.reload(); 
                }
            };
        } else {
            btn.innerHTML = '<i class="fa-solid fa-right-to-bracket d-sm-none"></i><span class="d-none d-sm-inline">로그인</span>';
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-outline-danger');
            btn.href = 'login.html';
            btn.onclick = null;
        }
    });

    dashboardMenus.forEach(menu => {
        if (isLoggedIn) {
            menu.style.display = 'block';
            menu.style.setProperty('display', 'block', 'important'); 
        } else {
            menu.style.display = 'none';
        }
    });
}

const observer = new MutationObserver((mutations, obs) => {
    if (document.getElementById('nav-auth-btn')) {
        checkLoginStatus();
        obs.disconnect(); 
    }
});
observer.observe(document.body, { childList: true, subtree: true });

const teamData = {
    "Red Bull": { color: "#3671C6", logo: "img/logo/redbull.svg" },
    "Ferrari": { color: "#E8002D", logo: "img/logo/ferrari.svg" },
    "Mercedes": { color: "#27F4D2", logo: "img/logo/mercedes.svg" },
    "McLaren": { color: "#FF8000", logo: "img/logo/mclaren.webp" },
    "Aston Martin": { color: "#229971", logo: "img/logo/aston.svg" },
    "RB": { color: "#6692FF", logo: "img/logo/RB.svg" },
    "Haas": { color: "#E8002D", logo: "img/logo/hass.svg" },
    "Alpine": { color: "#00A1E8", logo: "img/logo/alpine.svg" },
    "Williams": { color: "#1868DB", logo: "img/logo/williams.webp" },
    "Audi": { color: "#FF2D00", logo: "img/logo/audi.svg" },
    "Cadillac": { color: "#AAAAAD", logo: "img/logo/cadillac.svg" },
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

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        const isLoggedIn = localStorage.getItem('f1_logged_in') === 'true';
        
        if (!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = "login.html";
            return;
        }

        initDashboardTabs();
    }
});

function initDashboardTabs() {
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'favorites'; 

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    document.querySelectorAll('.nav-link[data-bs-toggle="pill"]').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetButton = document.getElementById(`tab-${activeTab}`);
    const targetPane = document.getElementById(`content-${activeTab}`);
    
    if (targetButton && targetPane) {
        targetButton.classList.add('active');
        targetPane.classList.add('show', 'active');
    }
}

document.addEventListener('submit', function(e) {
    if (e.target && e.target.classList.contains('search-form')) {
        e.preventDefault(); 
        
        const input = e.target.querySelector('.search-input');
        if (!input) return;
        
        const query = input.value.trim().toLowerCase();
        
        if (query === "") {
            alert("이동하고 싶은 메뉴나 키워드를 입력해주세요! \n(예: 일정, 드라이버, 통계)");
            return;
        }

        // 앞에 있는 것부터 찾으므로 더 구체적인 말을 먼저 둔다 (예: '사이트 소개'가 '소개'보다 먼저)
        const searchMap = {
            "사이트": "intro.html",
            "지도": "circuit.html#circuit-map-section",
            "뉴스": "news.html",
            "소식": "news.html",
            "라인업": "drivers.html",
            "프로필": "drivers.html",
            "팀 목록": "teams.html",
            "로그인": "login.html",
            "회원가입": "login.html",
            "홈": "index.html",
            "메인": "index.html",
            "일정": "schedule.html",
            "결과": "schedule.html",
            "서킷": "circuit.html",
            "하이라이트": "highlights.html",
            "영상": "highlights.html",
            "드라이버": "driver_standings.html",
            "순위": "driver_standings.html",
            "선수": "driver_standings.html",
            "팀": "team_standings.html",
            "컨스트럭터": "team_standings.html",
            "통계": "statistics.html",
            "대시보드": "statistics.html",
            "차트": "statistics.html",
            "역대": "history.html",
            "기록": "history.html",
            "우승": "history.html",
            "소개": "about.html",
            "제작자": "about.html",
            "굿즈": "shop.html",
            "쇼핑": "shop.html",
            "스토어": "shop.html"
        };

        let targetUrl = "";

        for (const [keyword, url] of Object.entries(searchMap)) {
            if (query.includes(keyword) || keyword.includes(query)) {
                targetUrl = url;
                break;
            }
        }

        if (targetUrl) {
            window.location.href = targetUrl;
        } else {
            alert(`'${query}'에 해당하는 메뉴를 찾지 못했습니다.\n(추천 검색어: 일정, 드라이버, 팀, 통계, 굿즈)`);
        }
    }
});