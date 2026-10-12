// ----------------------------------------------------
// 서브 페이지: 드라이버 상세 목록 (drivers.js)
// ----------------------------------------------------

let ACTIVE_YEAR = new Date().getFullYear(); 
let currentSeasonStandings = []; 
let currentSeasonPodiums = {};

const driverProfileImages = {
    "max_verstappen": "img/driver/max.webp",
    "hadjar": "img/driver/hadjar.webp",
    "russell": "img/driver/russel.webp",
    "antonelli": "img/driver/antonelli.webp",
    "leclerc": "img/driver/leclerc.webp",
    "hamilton": "img/driver/hamilton.webp",
    "norris": "img/driver/norris.webp",
    "piastri": "img/driver/piastri.webp",
    "alonso": "img/driver/alonso.webp",
    "stroll": "img/driver/stroll.webp",
    "gasly": "img/driver/gasly.webp",
    "colapinto": "img/driver/colapinto.webp",
    "albon": "img/driver/albon.webp",
    "sainz": "img/driver/sainz.webp",
    "lawson": "img/driver/lawson.webp",
    "arvid_lindblad": "img/driver/arvid.webp", 
    "ocon": "img/driver/ocon.webp",
    "bearman": "img/driver/bearman.webp",
    "hulkenberg": "img/driver/hulkenberg.webp",
    "bortoleto": "img/driver/bortoleto.webp",
    "perez": "img/driver/perez.webp",
    "bottas": "img/driver/bottas.webp",
    "tsunoda": "img/driver/tsunoda.webp",   // F1 공식 2026 레이싱 불스 사진
};

const driverNumberImages = {
    "max_verstappen": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01numberwhitefrless.webp",
    "hadjar": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01numberwhitefrless.webp",
    "russell": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01numberwhitefrless.webp",
    "antonelli": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01numberwhitefrless.webp",
    "leclerc": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01numberwhitefrless.webp",
    "hamilton": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01numberwhitefrless.webp",
    "norris": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01numberwhitefrless.webp",
    "piastri": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01numberwhitefrless.webp",
    "alonso": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01numberwhitefrless.webp",
    "stroll": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01numberwhitefrless.webp",
    "gasly": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01numberwhitefrless.webp",
    "colapinto": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01numberwhitefrless.webp",
    "albon": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01numberwhitefrless.webp",
    "sainz": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01numberwhitefrless.webp",
    "lawson": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01numberwhitefrless.webp",
    "arvid_lindblad": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01numberwhitefrless.webp", 
    "ocon": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01numberwhitefrless.webp",
    "bearman": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01numberwhitefrless.webp",
    "hulkenberg": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01numberwhitefrless.webp",
    "bortoleto": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01numberwhitefrless.webp",
    "perez": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01numberwhitefrless.webp",
    "bottas": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01numberwhitefrless.webp",
    "tsunoda": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/yuktsu01/2026racingbullsyuktsu01numberwhitefrless.webp",
};

const driverStatsDB = {
    // 2021~2025 기록 (Jolpica F1 API로 계산) — 2026 대체 출전
    "tsunoda": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 0, f1Podiums: 0, entered: 114, points: 108, poles: 0, highest: "4 (x1)" },
    "hamilton": { f1Titles: 7, f1Years: "2008, 2014, 2015, 2017, 2018, 2019, 2020", f2Titles: 1, f3Titles: 1, juniorTitles: 0, f1Wins: 105, f1Podiums: 201, entered: 353, points: 4829.5, poles: 104, highest: "1 (x105)" },
    "max_verstappen": { f1Titles: 4, f1Years: "2021, 2022, 2023, 2024", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 62, f1Podiums: 111, entered: 206, points: 2979.5, poles: 40, highest: "1 (x62)" },
    "alonso": { f1Titles: 2, f1Years: "2005, 2006", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 32, f1Podiums: 106, entered: 398, points: 2329, poles: 22, highest: "1 (x32)" },
    "norris": { f1Titles: 1, f1Years: "2025", f2Titles: 0, f3Titles: 1, juniorTitles: 0, f1Wins: 6, f1Podiums: 32, entered: 125, points: 934, poles: 8, highest: "1 (x6)" }, 
    "bottas": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 1, juniorTitles: 0, f1Wins: 10, f1Podiums: 67, entered: 243, points: 1797, poles: 20, highest: "1 (x10)" },
    "leclerc": { f1Titles: 0, f1Years: "", f2Titles: 1, f3Titles: 1, juniorTitles: 0, f1Wins: 8, f1Podiums: 41, entered: 144, points: 1381, poles: 26, highest: "1 (x8)" },
    "perez": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 6, f1Podiums: 39, entered: 278, points: 1637, poles: 3, highest: "1 (x6)" },
    "sainz": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 4, f1Podiums: 25, entered: 202, points: 1222.5, poles: 6, highest: "1 (x4)" },
    "russell": { f1Titles: 0, f1Years: "", f2Titles: 1, f3Titles: 1, juniorTitles: 0, f1Wins: 2, f1Podiums: 14, entered: 125, points: 661, poles: 3, highest: "1 (x2)" },
    "piastri": { f1Titles: 0, f1Years: "", f2Titles: 1, f3Titles: 1, juniorTitles: 0, f1Wins: 2, f1Podiums: 9, entered: 43, points: 359, poles: 0, highest: "1 (x2)" },
    "gasly": { f1Titles: 0, f1Years: "", f2Titles: 1, f3Titles: 0, juniorTitles: 0, f1Wins: 1, f1Podiums: 4, entered: 150, points: 420, poles: 0, highest: "1 (x1)" },
    "ocon": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 1, juniorTitles: 0, f1Wins: 1, f1Podiums: 3, entered: 153, points: 445, poles: 0, highest: "1 (x1)" },
    "hulkenberg": { f1Titles: 0, f1Years: "", f2Titles: 1, f3Titles: 1, juniorTitles: 0, f1Wins: 0, f1Podiums: 1, entered: 224, points: 552, poles: 1, highest: "3 (x1)" }, 
    "stroll": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 1, juniorTitles: 0, f1Wins: 0, f1Podiums: 3, entered: 163, points: 292, poles: 1, highest: "3 (x3)" },
    "albon": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 0, f1Podiums: 2, entered: 101, points: 240, poles: 0, highest: "3 (x2)" },
    "antonelli": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 4, f1Wins: 0, f1Podiums: 3, entered: 14, points: 112, poles: 0, highest: "2 (x1)" },
    "hadjar": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 0, f1Podiums: 1, entered: 10, points: 42, poles: 0, highest: "3 (x1)" },
    "bearman": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 2, f1Wins: 0, f1Podiums: 0, entered: 22, points: 24, poles: 0, highest: "7 (x1)" },
    "colapinto": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 1, f1Wins: 0, f1Podiums: 0, entered: 22, points: 18, poles: 0, highest: "8 (x1)" },
    "lawson": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 1, f1Wins: 0, f1Podiums: 0, entered: 22, points: 35, poles: 0, highest: "6 (x1)" },
    "bortoleto": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 1, juniorTitles: 0, f1Wins: 0, f1Podiums: 0, entered: 0, points: 0, poles: 0, highest: "N/A" },
    "arvid_lindblad": { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 1, f1Wins: 0, f1Podiums: 0, entered: 0, points: 0, poles: 0, highest: "N/A" }
};

function getFlagUrl(nationality) {
    const flagMap = {
        "British": "gb", "Dutch": "nl", "Monegasque": "mc", "Spanish": "es",
        "French": "fr", "Mexican": "mx", "Australian": "au", "Finnish": "fi",
        "Canadian": "ca", "Thai": "th", "Japanese": "jp", "Chinese": "cn",
        "Danish": "dk", "German": "de", "American": "us", "Argentine": "ar",
        "Brazilian": "br", "Italian": "it", "New Zealander": "nz"
    };
    const code = flagMap[nationality];
    return code ? `https://flagcdn.com/w40/${code}.png` : ""; 
}

document.addEventListener('DOMContentLoaded', fetchDriverProfiles);

async function fetchDriverProfiles() {
    const container = document.getElementById('driver-list-container');
    
    const titleObj = document.getElementById('hero-title');
    if (titleObj) titleObj.innerHTML = `${ACTIVE_YEAR} DRIVER <span class="text-danger">LINEUP</span>`;

    try {
        const teamResponse = await fetch(`${JOLPICA_BASE_URL}/${ACTIVE_YEAR}/constructorStandings.json`);
        const teamDataRes = await teamResponse.json();
        const teams = teamDataRes.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        const dResponse = await fetch(`${JOLPICA_BASE_URL}/${ACTIVE_YEAR}/driverStandings.json`);
        const dData = await dResponse.json();
        currentSeasonStandings = dData.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        try {
            const podiumResults = await fetchSeasonPodiumResults(ACTIVE_YEAR);
            podiumResults.forEach(res => {
                const drvId = res.Driver.driverId;
                currentSeasonPodiums[drvId] = (currentSeasonPodiums[drvId] || 0) + 1;
            });
        } catch (e) {
            console.error("포디움 스캔 에러 (경기가 없거나 서버 응답 지연):", e);
        }

        container.innerHTML = '';

        const lineup = await fetchCurrentLineup(ACTIVE_YEAR);
        const regularIds = new Set();

        for (let t of teams) {
            const constructorId = t.Constructor.constructorId;
            const constructorName = t.Constructor.name;
            const cleanTeam = getCleanTeamName(constructorName);
            const tInfo = teamData[cleanTeam] || teamData["default"];

            let teamDrivers;
            if (lineup && lineup[constructorId]) {
                teamDrivers = lineup[constructorId];
            } else {
                // 아직 경기가 없는 시즌 등: 예전 방식(팀 드라이버 목록에서 등번호 있는 2명)
                const driverResponse = await fetch(`${JOLPICA_BASE_URL}/${ACTIVE_YEAR}/constructors/${constructorId}/drivers.json`);
                const driverData = await driverResponse.json();
                teamDrivers = driverData.MRData.DriverTable.Drivers.filter(driver => driver.permanentNumber).slice(0, 2);
            }

            teamDrivers.forEach(driver => {
                regularIds.add(driver.driverId);
                renderDriverCard(container, driver, constructorName, tInfo);
            });
        }

        // 정규 드라이버 대신 레이스에 나선 드라이버 (예: 2026 R12~R14 RB의 츠노다)
        const subs = currentSeasonStandings.filter(s => !regularIds.has(s.Driver.driverId));
        if (subs.length > 0) {
            container.insertAdjacentHTML('beforeend', `
                <div class="col-12 mt-5 mb-2">
                    <h3 class="fw-black text-white border-bottom border-secondary pb-2 font-noto"><i class="fa-solid fa-right-left text-danger me-2"></i>대체 출전 드라이버</h3>
                    <p class="text-white-50 small font-noto mb-0">이번 시즌 정규 드라이버 대신 레이스에 출전한 드라이버입니다.</p>
                </div>
            `);
            subs.forEach(s => {
                const team = s.Constructors[s.Constructors.length - 1];
                const tInfo = teamData[getCleanTeamName(team.name)] || teamData["default"];
                renderDriverCard(container, s.Driver, team.name, tInfo, true);
            });
        }


    } catch (error) {
        console.error("드라이버 라인업 로드 에러:", error);
        container.innerHTML = `<div class="alert alert-danger w-100 text-center fw-bold">드라이버 데이터를 불러오는데 실패했습니다. 통신 상태를 확인해주세요.</div>`;
    }
}

// 드라이버 카드 한 장 (정규 드라이버 / 대체 출전 드라이버 공통)
function renderDriverCard(container, driver, constructorName, tInfo, isSub = false) {
    const age = calculateAge(driver.dateOfBirth);
    let photoUrl = driverProfileImages[driver.driverId] || "img/driver/silhouette.svg";
    const numberImg = driverNumberImages[driver.driverId] || "";
    const flagUrl = getFlagUrl(driver.nationality);
    
    const stats = driverStatsDB[driver.driverId] || { f1Titles: 0, f1Years: "", f2Titles: 0, f3Titles: 0, juniorTitles: 0, f1Wins: 0, f1Podiums: 0 };
    
    const seasonData = currentSeasonStandings.find(d => d.Driver.driverId === driver.driverId);
    const currentSeasonWins = seasonData ? parseInt(seasonData.wins) : 0;
    const currentSeasonPods = currentSeasonPodiums[driver.driverId] || 0;
    const totalCombinedWins = stats.f1Wins + currentSeasonWins; 
    const totalCombinedPodiums = stats.f1Podiums + currentSeasonPods;

    let champBadges = '';
    if (stats.f2Titles > 0) champBadges += `<span class="badge border border-light text-white-50 me-1 mb-1">F2 챔피언 x${stats.f2Titles}</span>`;
    if (stats.f3Titles > 0) champBadges += `<span class="badge border border-light text-white-50 me-1 mb-1">F3 챔피언 x${stats.f3Titles}</span>`;
    if (stats.juniorTitles > 0) champBadges += `<span class="badge border border-light text-white-50 mb-1">주니어 챔피언 x${stats.juniorTitles}</span>`;

    let statsHTML = '';
    
    if (stats.f1Titles > 0) {
        statsHTML = `
            <div class="mb-2">
                <span class="champion-badge me-1"><i class="fa-solid fa-crown me-1"></i> 월드 챔피언 ${stats.f1Titles}회</span>
                ${champBadges !== '' ? `<div class="d-inline-block">${champBadges}</div>` : ''}
            </div>
            <div class="d-flex flex-column w-100">
                <div class="text-warning fw-bold small mb-2" style="font-size: 0.85rem;">🏆 달성 연도: ${stats.f1Years}</div>
                <div class="d-flex justify-content-between align-items-center w-100 px-3 py-1 rounded" style="background: rgba(0,0,0,0.2);">
                    <div class="text-white-50 small text-nowrap"><i class="fa-solid fa-trophy text-warning me-1"></i> GP 우승: <strong class="text-white fs-6 mx-1">${totalCombinedWins}</strong>회</div>
                    <div class="text-white-50 small text-nowrap"><i class="fa-solid fa-medal text-secondary me-1"></i> 포디움: <strong class="text-white fs-6 mx-1">${totalCombinedPodiums}</strong>회</div>
                </div>
            </div>
        `;
    } else {
        statsHTML = `
            ${champBadges !== '' ? `<div class="mb-2">${champBadges}</div>` : ''}
            <div class="d-flex justify-content-between align-items-center w-100 px-3 py-2 rounded mt-2" style="background: rgba(0,0,0,0.2);">
                <div class="text-white-50 small text-nowrap">
                    <i class="fa-solid fa-trophy ${totalCombinedWins > 0 ? 'text-warning' : 'text-secondary'} me-1"></i> GP 우승: <strong class="${totalCombinedWins > 0 ? 'text-white' : 'text-white-50'} fs-6 mx-1">${totalCombinedWins}</strong>회
                </div>
                <div class="text-white-50 small text-nowrap">
                    <i class="fa-solid fa-medal text-secondary me-1"></i> 포디움: <strong class="${totalCombinedPodiums > 0 ? 'text-white' : 'text-white-50'} fs-6 mx-1">${totalCombinedPodiums}</strong>회
                </div>
            </div>
        `;
    }

    container.insertAdjacentHTML('beforeend', `
        <div class="col-xl-6 col-lg-6 mb-2">
            <div class="f1-driver-card" style="background-color: ${tInfo.color};" onclick="openDriverDetail('${driver.driverId}', '${driver.givenName}', '${driver.familyName}', '${tInfo.color}')">
                <div class="f1-card-overlay"></div>
                <div class="f1-card-content">
                    <div class="f1-card-top">
                        <div class="f1-info-left">
                            <div class="mb-2">
                                <span class="f1-first-name">${driver.givenName}</span>
                                <span class="f1-last-name">${driver.familyName}</span>
                                <span class="f1-team-name d-block">${constructorName}${isSub ? ' <span class="badge bg-dark border border-light ms-1">대체 출전</span>' : ''}</span>
                            </div>
                            <div>
                                ${numberImg ? `<img src="${numberImg}" class="f1-number-img" alt="${driver.permanentNumber}">` : `<div class="f1-number-text">${driver.permanentNumber || ''}</div>`}
                            </div>
                            <div class="f1-flag mt-auto">
                                ${flagUrl ? `<img src="${flagUrl}" alt="${driver.nationality}">` : `<span class="badge bg-dark">${driver.nationality}</span>`}
                            </div>
                        </div>
                        <img src="${photoUrl}" class="f1-photo-right" alt="${driver.familyName}">
                    </div>
                    <div class="f1-card-bottom">
                        <div class="d-flex justify-content-between align-items-center mb-2 text-white-50 small font-noto">
                            <span><i class="fa-solid fa-cake-candles me-2"></i>${driver.dateOfBirth} (만 ${age}세)</span>
                            <span><i class="fa-solid fa-earth-americas me-1"></i>${driver.nationality}</span>
                        </div>
                        <div class="border-top border-secondary pt-2 font-noto w-100">
                            ${statsHTML}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function calculateAge(birthDate) {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function openDriverDetail(driverId, givenName, familyName, teamColor) {
    const stats = driverStatsDB[driverId] || { entered: 0, points: 0, highest: "N/A", f1Podiums: 0, poles: 0, f1Titles: 0, f1Wins: 0 };
    const seasonData = currentSeasonStandings.find(d => d.Driver.driverId === driverId);
    
    // 실시간 당해 기록 추가 합산
    const currentPts = seasonData ? parseFloat(seasonData.points) : 0;
    const currentPods = currentSeasonPodiums[driverId] || 0; 
    const totalCombinedPoints = (parseFloat(stats.points) + currentPts).toFixed(1);
    const totalCombinedPodiums = stats.f1Podiums + currentPods;

    document.getElementById('m-season-title').innerText = `${ACTIVE_YEAR} 시즌`;
    document.getElementById('modalHeaderColor').style.borderBottom = `5px solid ${teamColor}`;
    document.getElementById('modalDriverName').innerHTML = `${givenName} <span class="text-uppercase" style="color: ${teamColor};">${familyName}</span>`;

    // 좌측: 실시간 시즌 기록
    document.getElementById('m-season-pos').innerText = seasonData ? `${seasonData.position}위` : "-";
    document.getElementById('m-season-pts').innerText = seasonData ? `${seasonData.points} 점` : "0 점";
    document.getElementById('m-season-wins').innerText = seasonData ? `${seasonData.wins} 회` : "0 회";
    document.getElementById('m-season-podiums').innerText = `${currentPods} 회`; 

    // 우측: 누적 커리어 통계
    document.getElementById('m-career-entered').innerText = `${stats.entered} 경기`;
    document.getElementById('m-career-pts').innerText = totalCombinedPoints.endsWith('.0') ? parseInt(totalCombinedPoints) : totalCombinedPoints;
    document.getElementById('m-career-highest').innerText = stats.highest;
    document.getElementById('m-career-podiums').innerText = `${totalCombinedPodiums} 회`;
    document.getElementById('m-career-poles').innerText = `${stats.poles} 회`;
    document.getElementById('m-career-champs').innerText = `${stats.f1Titles} 회`;

    const detailModal = new bootstrap.Modal(document.getElementById('driverDetailModal'));
    detailModal.show();
}