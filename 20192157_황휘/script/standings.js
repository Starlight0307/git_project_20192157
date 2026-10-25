// ----------------------------------------------------
// 서브 페이지: 실시간 순위 데이터 연동 (standings.js)
// ----------------------------------------------------

const currentAutoYear = new Date().getFullYear(); 

// 드라이버 프로필 사진 → driverImages (common.js — 홈 드라이버 챔피언십 카드와 함께 씀)

// 오피셜 등번호 로고 → getNumberImageUrl (common.js — 홈·순위·통계가 함께 씀)

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.toLowerCase();
    
    const isDriverPage = currentPath.includes('driver') || (document.getElementById('driver-standings-container') && !document.getElementById('driver-standings-container').classList.contains('d-none'));
    const isTeamPage = currentPath.includes('team') || (document.getElementById('team-standings-container') && !document.getElementById('team-standings-container').classList.contains('d-none'));

    if (isDriverPage) {
        fetchDriverStandings();
    } else if (isTeamPage) {
        fetchConstructorStandings();
    }
});

// 드라이버 순위 로드
async function fetchDriverStandings() {
    const container = document.getElementById('driver-standings-container');
    if (!container) return;
    
    try {
        const response = await fetch(`${JOLPICA_BASE_URL}/${currentAutoYear}/driverStandings.json`);
        const data = await response.json();
        
        const standingsList = data.MRData.StandingsTable.StandingsLists[0];
        const drivers = standingsList.DriverStandings;
        const seasonYear = standingsList.season;

        container.innerHTML = `<h5 class="text-white-50 font-noto mb-4"><i class="fa-solid fa-flag-checkered me-2"></i>${seasonYear} 시즌 실시간 순위</h5>`;

        drivers.forEach(driverInfo => {
            const pos = driverInfo.position;
            const points = driverInfo.points;
            const wins = driverInfo.wins;
            const driverData = driverInfo.Driver;
            const constructorData = driverInfo.Constructors[0];

            const fullName = `${driverData.givenName} <strong class="text-white">${driverData.familyName}</strong>`;
            const driverId = driverData.driverId;
            const permanentNumber = driverData.permanentNumber || "00";

            const photoUrl = driverImages[driverId] || "img/driver/silhouette.svg";

            const cleanTeamName = getCleanTeamName(constructorData.name);
            const tData = teamData[cleanTeamName] || teamData["default"];
            const teamColor = tData.color;
            const teamLogoUrl = tData.logo;

            const numberImgUrl = getNumberImageUrl(driverId);
            
            const numberGraphicHTML = numberImgUrl 
                ? `<img src="${numberImgUrl}" class="watermark-number-img" alt="${permanentNumber}" referrerpolicy="no-referrer" style="filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.4));" onerror="this.outerHTML='<span class=\\'fallback-number\\' style=\\'color:${teamColor}; text-shadow: 0 0 10px rgba(255,255,255,0.3);\\'>${permanentNumber}</span>'">` 
                : `<span class="fallback-number" style="color:${teamColor}; text-shadow: 0 0 10px rgba(255,255,255,0.3);">${permanentNumber}</span>`;

            let posClass = "";
            if(pos === "1") posClass = "pos-1";
            else if(pos === "2") posClass = "pos-2";
            else if(pos === "3") posClass = "pos-3";

            container.insertAdjacentHTML('beforeend', `
                <div class="driver-row d-flex align-items-center p-3">
                    <div class="team-color-bar" style="background-color: ${teamColor};"></div>
                    
                    <div class="position-badge ${posClass} me-3">${pos}</div>
                    
                    <div class="driver-photo-container me-4" style="border-color: ${teamColor}80;">
                        <img src="${photoUrl}" alt="${driverData.familyName}" class="driver-photo" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='img/driver/silhouette.svg'">
                    </div>
                    
                    <div class="flex-grow-1 info-container">
                        <h4 class="text-white m-0 mb-1" style="font-family: 'Urbanist', sans-serif;">${fullName}</h4>
                        
                        <div class="d-flex align-items-center">
                            ${teamLogoUrl ? `<img src="${teamLogoUrl}" class="team-logo-sm me-2" alt="${cleanTeamName}" referrerpolicy="no-referrer">` : ''}
                            <span class="badge border border-secondary text-white-50 bg-dark">${constructorData.name}</span>
                            ${wins > 0 ? `<span class="badge bg-warning text-dark fw-bold ms-2"><i class="fa-solid fa-trophy me-1"></i>${wins} Wins</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="bg-watermark" style="opacity: 0.8;">
                        ${teamLogoUrl ? `<img src="${teamLogoUrl}" class="watermark-team-logo" alt="logo" referrerpolicy="no-referrer" style="filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.3));">` : ''}
                        ${numberGraphicHTML}
                    </div>
                    
                    <div class="points-display">
                        ${points} <span class="fs-6 small">PTS</span>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error("드라이버 순위 로드 에러:", error);
        container.innerHTML = `<div class="alert alert-danger text-center fw-bold">순위 데이터를 불러오는 데 실패했습니다. 통신 상태를 확인해주세요.</div>`;
    }
}

// 팀 순위 로드
async function fetchConstructorStandings() {
    const container = document.getElementById('team-standings-container');
    if (!container) return;

    try {
        const response = await fetch(`${JOLPICA_BASE_URL}/${currentAutoYear}/constructorStandings.json`);
        const data = await response.json();
        
        const standingsList = data.MRData.StandingsTable.StandingsLists[0];
        const constructors = standingsList.ConstructorStandings;
        const seasonYear = standingsList.season;

        container.innerHTML = `<div class="col-12 mb-2"><h5 class="text-white-50 font-noto"><i class="fa-solid fa-flag-checkered me-2"></i>${seasonYear} 시즌 실시간 순위</h5></div>`;

        constructors.forEach(teamInfo => {
            const pos = teamInfo.position;
            const points = teamInfo.points;
            const wins = teamInfo.wins;
            const teamDetails = teamInfo.Constructor;

            const cleanTeamName = getCleanTeamName(teamDetails.name);
            const tData = teamData[cleanTeamName] || teamData["default"];
            const teamColor = tData.color;
            const teamLogo = tData.logo;

            const logoHTML = teamLogo ? `<img src="${teamLogo}" class="team-logo-bg" alt="logo" referrerpolicy="no-referrer">` : '';

            container.insertAdjacentHTML('beforeend', `
                <div class="col-md-6 col-lg-4">
                    <div class="team-card h-100 d-flex flex-column">
                        <div class="team-color-header" style="background-color: ${teamColor};"></div>
                        ${logoHTML}
                        
                        <div class="p-4 flex-grow-1 position-relative" style="z-index: 1;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-dark border border-secondary text-white-50 fs-6">Rank ${pos}</span>
                                ${wins > 0 ? `<span class="badge bg-warning text-dark fw-bold"><i class="fa-solid fa-trophy me-1"></i>${wins} Wins</span>` : ''}
                            </div>
                            
                            <h3 class="fw-black text-white m-0" style="letter-spacing: -1px;">${teamDetails.name}</h3>
                            <p class="text-white-50 small mb-4">Nationality: ${teamDetails.nationality}</p>
                            
                            <div class="mt-auto">
                                <div class="points-badge" style="border-color: ${teamColor}; box-shadow: 0 0 15px ${teamColor}33;">
                                    ${points} <span class="fs-6 text-white-50">PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error("팀 순위 로드 에러:", error);
        container.innerHTML = `<div class="col-12 text-center"><div class="alert alert-danger fw-bold">순위 데이터를 불러오는 데 실패했습니다. 통신 상태를 확인해주세요.</div></div>`;
    }
}