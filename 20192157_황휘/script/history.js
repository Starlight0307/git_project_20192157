// ----------------------------------------------------
// 서브 페이지: 역대 기록 (history.js)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('history-container')) {
        fetchHistory();
    }
});

async function fetchHistory() {
    const container = document.getElementById('history-container');
    const currentYear = new Date().getFullYear();
    
    try {
        const yearsToFetch = [];
        for (let i = 1; i <= 15; i++) {
            yearsToFetch.push(currentYear - i);
        }

        // 지난 시즌 챔피언은 바뀌지 않으므로 브라우저에 저장해 두고 다시 받지 않는다
        const CACHE_KEY = 'f1ChampionCache';
        let cache = {};
        try { cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { cache = {}; }

        const fetchYear = async (year) => {
            for (let attempt = 0; attempt < 3; attempt++) {
                const res = await fetch(`${JOLPICA_BASE_URL}/${year}/driverStandings/1.json`);
                if (res.status === 429) {   // 요청이 몰리면 잠깐 쉬었다가 다시
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }
                if (!res.ok) throw new Error(`${year}년 데이터 로드 실패 (상태: ${res.status})`);
                return res.json();
            }
            throw new Error(`API 서버 요청 한도 초과(429). 잠시 후 다시 시도해주세요.`);
        };

        // 한 번에 4년씩 동시에 받는다 (15번을 하나씩 기다리면 10초 넘게 걸림)
        const missing = yearsToFetch.filter(year => !cache[year]);
        for (let i = 0; i < missing.length; i += 4) {
            const batch = missing.slice(i, i + 4);
            const results = await Promise.all(batch.map(fetchYear));
            batch.forEach((year, idx) => { cache[year] = results[idx]; });
            if (i + 4 < missing.length) await new Promise(resolve => setTimeout(resolve, 250));
        }
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* 저장 못 해도 화면은 그대로 */ }

        const seasonResults = yearsToFetch.map(year => cache[year]);
        
        container.innerHTML = ''; 

        seasonResults.forEach(data => {
            const standingsLists = data.MRData.StandingsTable.StandingsLists;
            
           if (!standingsLists || standingsLists.length === 0) return;

            const seasonData = standingsLists[0];
            const year = seasonData.season;
            const championInfo = seasonData.DriverStandings[0];
            
            if (!championInfo) return;

            const driverData = championInfo.Driver;
            const teamDataRes = championInfo.Constructors[0];

            const fullName = `${driverData.givenName} <strong class="text-white">${driverData.familyName}</strong>`;
            const points = championInfo.points;
            const wins = championInfo.wins;

            let teamColor = '#888888';
            try {
                if (typeof teamData !== 'undefined') {
                    const cleanTeamName = getCleanTeamName(teamDataRes.name);
                    if (teamData[cleanTeamName] && teamData[cleanTeamName].color) {
                        teamColor = teamData[cleanTeamName].color;
                    } else if (teamData["default"] && teamData["default"].color) {
                        teamColor = teamData["default"].color;
                    }
                }
            } catch (e) {
                console.warn(`${year}년 팀 색상 처리 중 예외 발생:`, e);
            }

            container.insertAdjacentHTML('beforeend', `
                <div class="champion-card">
                    <div class="year-badge me-4">${year}</div>
                    
                    <div class="flex-grow-1">
                        <h3 class="text-white m-0 mb-1" style="font-family: 'Urbanist', sans-serif;">${fullName}</h3>
                        <div class="d-flex align-items-center">
                            <span class="badge border border-secondary text-white-50 bg-dark me-2" style="border-left: 4px solid ${teamColor} !important;">
                                ${teamDataRes.name}
                            </span>
                        </div>
                    </div>
                    
                    <div class="text-end">
                        <div class="text-warning fw-bold mb-1"><i class="fa-solid fa-trophy me-1"></i>${wins} Wins</div>
                        <div class="text-white-50 small">${points} PTS</div>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error("역대 기록 로드 에러:", error);
        container.innerHTML = `
            <div class="alert alert-danger text-center fw-bold">
                기록 데이터를 불러오는 데 실패했습니다. 통신 상태를 확인해주세요.<br>
                <small class="fw-normal text-white-50 mt-2 d-block">${error.message}</small>
            </div>
        `;
    }
}