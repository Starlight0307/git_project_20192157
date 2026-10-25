// ----------------------------------------------------
// 서브 페이지: 팀 상세 목록 및 프로필 (teams.js)
// ----------------------------------------------------

const ACTIVE_YEAR = new Date().getFullYear();
let currentSeasonStandings = []; 
let currentSeasonPodiums = {}; 

// 팀별 차량 → teamAssets (common.js — 홈 컨스트럭터 카드와 함께 씀)

// 팀 카드 뒤에 깔리는 로고 중 따로 만든 것
// 레드불: 원래 로고를 통째로 흰색으로 바꾸면 황소와 해가 한 덩어리가 됨 → 황소는 흰색, 해는 옅은 흰색인 실루엣
const WATERMARK_LOGOS = {
    "Red Bull": "img/logo/redbull-silhouette.svg"
};

// 팀 CEO 프로필 
const teamPrincipals = {
    "Red Bull": { name: "Laurent Mekies", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Laurent_Mekies_%2854917242735%29_%28cropped%29.jpg/500px-Laurent_Mekies_%2854917242735%29_%28cropped%29.jpg" },
    "Mercedes": { name: "Toto Wolff", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Toto_Wolff_2022_%2852474843183%29_%28cropped%29.jpg/500px-Toto_Wolff_2022_%2852474843183%29_%28cropped%29.jpg" },
    "Ferrari": { name: "Frédéric Vasseur", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/MJXKPW_240117_SF_F1_FVasseur_Red_PR_AN_076161-1920x0_YRHUGH_%28close-up%29.jpg/500px-MJXKPW_240117_SF_F1_FVasseur_Red_PR_AN_076161-1920x0_YRHUGH_%28close-up%29.jpg" },
    "McLaren": { name: "Zak Brown", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/ZB-HEADSHOT-2026.jpg/500px-ZB-HEADSHOT-2026.jpg" },
    "Aston Martin": { name: "Andy Cowell", photo: "img/driver/silhouette.svg" },
    "Alpine": { name: "Flavio Briatore", photo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Briatore_66%C3%A8me_Festival_de_Venise_%28Mostra%29_-_cropped.jpg" },
    "RB": { name: "Peter Bayer", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/2026_Chinese_GP_-_Peter_Bayer.jpg/500px-2026_Chinese_GP_-_Peter_Bayer.jpg" },
    "Haas": { name: "Ayao Komatsu", photo: "img/driver/silhouette.svg" },
    "Williams": { name: "James Vowles", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/James_Vowles_at_Goodwood_FOS.png/500px-James_Vowles_at_Goodwood_FOS.png" },
    "Audi": { name: "Mattia Binotto", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Mattia_Binotto%2C_2022_%28cropped%29.jpg/500px-Mattia_Binotto%2C_2022_%28cropped%29.jpg" },
    "Cadillac": { name: "Michael Andretti", photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Michael_Andretti_%2853785910028%29_%28cropped%29.jpg/500px-Michael_Andretti_%2853785910028%29_%28cropped%29.jpg" }
};

//  드라이버 이미지 
const driverMiniAvatars = {
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
    "tsunoda": "img/driver/tsunoda.webp"   // F1 공식 2026 레이싱 불스 사진
};

const driverProfileImages = { ...driverMiniAvatars }; 

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
    "tsunoda": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/yuktsu01/2026racingbullsyuktsu01numberwhitefrless.webp"
};

// 팀 역대 통계 DB 
const teamStatsDB = {
    "Ferrari": { entered: 1095, points: 10229, highest: "1 (x248)", podiums: 825, poles: 253, titles: 16 },
    "McLaren": { entered: 967, points: 6830.5, highest: "1 (x188)", podiums: 522, poles: 163, titles: 8 },
    "Mercedes": { entered: 314, points: 7654.5, highest: "1 (x128)", podiums: 295, poles: 139, titles: 8 },
    "Red Bull": { entered: 390, points: 7792, highest: "1 (x121)", podiums: 281, poles: 103, titles: 6 },
    "Williams": { entered: 825, points: 3630, highest: "1 (x114)", podiums: 313, poles: 128, titles: 9 },
    "Alpine": { entered: 450, points: 2132, highest: "1 (x36)", podiums: 105, poles: 51, titles: 2 }, 
    "Aston Martin": { entered: 90, points: 432, highest: "2 (x3)", podiums: 9, poles: 0, titles: 0 },
    "Haas": { entered: 187, points: 295, highest: "4 (x1)", podiums: 0, poles: 1, titles: 0 },
    "RB": { entered: 370, points: 915, highest: "1 (x2)", podiums: 5, poles: 1, titles: 0 },
    "Audi": { entered: 0, points: 0, highest: "N/A", podiums: 0, poles: 0, titles: 0 }, 
    "Cadillac": { entered: 0, points: 0, highest: "N/A", podiums: 0, poles: 0, titles: 0 } 
};

// 국기 매핑 
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

document.addEventListener('DOMContentLoaded', fetchTeamProfiles);

async function fetchTeamProfiles() {
    const container = document.getElementById('team-list-container');
    
    try {
        const teamResponse = await fetch(`${JOLPICA_BASE_URL}/${ACTIVE_YEAR}/constructorStandings.json`);
        const teamDataRes = await teamResponse.json();
        const teams = teamDataRes.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        currentSeasonStandings = teams; 

        const dResponse = await fetch(`${JOLPICA_BASE_URL}/${ACTIVE_YEAR}/driverStandings.json`);
        const dData = await dResponse.json();
        const allDrivers = dData.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        try {
            const podiumResults = await fetchSeasonPodiumResults(ACTIVE_YEAR);
            podiumResults.forEach(res => {
                const teamId = res.Constructor.constructorId;
                currentSeasonPodiums[teamId] = (currentSeasonPodiums[teamId] || 0) + 1;
            });
        } catch(e) {}

        const lineup = await fetchCurrentLineup(ACTIVE_YEAR);

        container.innerHTML = '';

        teams.forEach(t => {
            const constructorId = t.Constructor.constructorId;
            const constructorName = t.Constructor.name;
            const cleanTeam = getCleanTeamName(constructorName);
            const tInfo = teamData[cleanTeam] || teamData["default"];
            const tAssets = teamAssets[cleanTeam] || {};

            // 최근 경기에 나온 두 명이 지금 정규 드라이버 (대체 출전 드라이버가 섞이지 않게)
            let teamDrivers;
            if (lineup && lineup[constructorId]) {
                const ids = lineup[constructorId].map(d => d.driverId);
                teamDrivers = ids.map(id => allDrivers.find(d => d.Driver.driverId === id) || { Driver: lineup[constructorId].find(d => d.driverId === id) });
            } else {
                teamDrivers = allDrivers.filter(d => d.Constructors[0].constructorId === constructorId && d.Driver.permanentNumber).slice(0, 2);
            }

            let driversHTML = '';
            teamDrivers.forEach(d => {
                const given = d.Driver.givenName;
                const family = d.Driver.familyName.toUpperCase();
                const avatar = driverMiniAvatars[d.Driver.driverId] || "img/driver/silhouette.svg";
                
                driversHTML += `
                    <div class="mini-driver-box">
                        <img src="${avatar}" class="mini-avatar" alt="${family}" onerror="this.onerror=null; this.src='img/driver/silhouette.svg'">
                        <div>
                            <span class="text-white d-block" style="font-size: 0.75rem; line-height: 1;">${given}</span>
                            <span class="text-white fw-bold" style="font-size: 0.9rem; line-height: 1;">${family}</span>
                        </div>
                    </div>
                `;
            });

            container.insertAdjacentHTML('beforeend', `
                <div class="col-xl-6 col-lg-6 mb-2">
                    <div class="f1-team-card" style="background-color: ${tInfo.color};" onclick='openTeamDetailModal(${JSON.stringify({
                        id: constructorId,
                        name: constructorName,
                        cleanName: cleanTeam,
                        color: tInfo.color,
                        logo: tInfo.logo,
                        car: tAssets.car || "",
                        drivers: teamDrivers
                    }).replace(/'/g, "&apos;")})'>
                        
                        <img src="${WATERMARK_LOGOS[cleanTeam] || tInfo.logo}" class="card-logo-watermark wm-${cleanTeam.toLowerCase().replace(/\s+/g, '-')}" alt="watermark">
                        
                        <div class="p-4 position-relative z-3 h-100">
                            <h2 class="card-team-name">${constructorName.toUpperCase()}</h2>
                            <div class="d-flex mt-3">${driversHTML}</div>
                        </div>

                        <img src="${tAssets.car}" class="card-car-img" onerror="this.style.display='none'" alt="F1 Car">
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error("팀 로딩 실패:", error);
        container.innerHTML = `<div class="col-12 text-center text-white-50 py-5 font-noto">
            <i class="fa-solid fa-triangle-exclamation fa-2x mb-3 d-block text-danger"></i>
            팀 정보를 불러오지 못했어요. F1 데이터 서버가 느리거나 응답하지 않아요.<br>
            <button type="button" class="btn btn-outline-light btn-sm mt-3" onclick="location.reload()">다시 시도</button>
        </div>`;
    }
}

function openTeamDetailModal(teamObj) {
    const db = teamStatsDB[teamObj.cleanName] || { entered: 0, points: 0, highest: "-", podiums: 0, poles: 0, titles: 0 };
    const seasonData = currentSeasonStandings.find(t => t.Constructor.constructorId === teamObj.id);
    const info = teamPrincipals[teamObj.cleanName] || { name: "Team Principal", photo: "" };
    
    const currentPts = seasonData ? parseFloat(seasonData.points) : 0;
    const currentWins = seasonData ? parseInt(seasonData.wins) : 0;
    const currentPods = currentSeasonPodiums[teamObj.id] || 0;
    
    const totalCombinedPoints = (parseFloat(db.points) + currentPts).toFixed(1);
    const totalCombinedPods = db.podiums + currentPods;
    const totalCombinedEntered = db.entered + (currentPts > 0 ? 1 : 0); 

    // 히어로 배너 세팅
    document.getElementById('m-hero-bg').style.backgroundColor = teamObj.color;
    document.getElementById('m-team-car').src = teamObj.car;
    document.getElementById('m-team-name').innerText = teamObj.name.toUpperCase();
    
    const logoEl = document.getElementById('m-team-logo');
    logoEl.src = teamObj.logo;
    
    if (teamObj.cleanName === "Ferrari" || teamObj.cleanName === "Red Bull") {
        logoEl.style = "max-height: 60px; max-width: 140px; object-fit: contain;"; 
    } else {
        logoEl.style = "max-height: 60px; max-width: 140px; object-fit: contain; filter: brightness(0) invert(1);"; 
    }

    if (teamObj.drivers.length >= 2) {
        document.getElementById('m-hero-driver1').innerHTML = `${teamObj.drivers[0].Driver.givenName} <strong class="fw-black">${teamObj.drivers[0].Driver.familyName.toUpperCase()}</strong>`;
        document.getElementById('m-hero-driver2').innerHTML = `${teamObj.drivers[1].Driver.givenName} <strong class="fw-black">${teamObj.drivers[1].Driver.familyName.toUpperCase()}</strong>`;
    }

    const driversContainer = document.getElementById('m-drivers-container');
    driversContainer.innerHTML = '';
    
   driversContainer.insertAdjacentHTML('beforeend', `
    <div class="col-12 mb-4 d-flex justify-content-center"> <div class="d-flex flex-column align-items-center p-5 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 400px;">
            <img src="${info.photo}" 
                 style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 3px solid ${teamObj.color};" 
                 class="mb-3" 
                 onerror="this.onerror=null; this.src='img/driver/silhouette.svg'">
            
            <div class="text-center">
                <span class="d-block text-white-50 small fw-bold font-noto">Team Principal / CEO</span>
                <span class="d-block text-white fs-3 fw-black font-urbanist text-uppercase">${info.name}</span>
            </div>
        </div>
    </div>
`);

    teamObj.drivers.forEach(d => {
        const photoUrl = driverProfileImages[d.Driver.driverId] || "img/driver/silhouette.svg";
        const numberImg = driverNumberImages[d.Driver.driverId] || "";
        const flagUrl = getFlagUrl(d.Driver.nationality);

        driversContainer.insertAdjacentHTML('beforeend', `
            <div class="col-xl-6 col-lg-6">
                <div class="f1-driver-card-mini" style="background-color: ${teamObj.color};">
                    <div class="f1-card-top">
                        <div class="z-2" style="width:60%;">
                            <span class="text-white fw-bold d-block mb-n1">${d.Driver.givenName}</span>
                            <span class="text-white fw-black fs-3 text-uppercase d-block lh-1">${d.Driver.familyName}</span>
                            <div class="mt-3">
                                ${numberImg ? `<img src="${numberImg}" class="f1-number-img" alt="${d.Driver.permanentNumber}">` : `<div class="text-white fw-black fs-2 fst-italic" style="-webkit-text-stroke: 1px rgba(255,255,255,0.8); color: transparent;">${d.Driver.permanentNumber || ''}</div>`}
                            </div>
                        </div>
                        <div class="f1-flag mt-auto z-2 position-absolute" style="bottom: 15px;">
                             ${flagUrl ? `<img src="${flagUrl}" alt="${d.Driver.nationality}" style="width: 30px; border-radius: 2px;">` : `<span class="badge bg-dark">${d.Driver.nationality}</span>`}
                        </div>
                    </div>
                    <img src="${photoUrl}" class="f1-photo-right" alt="${d.Driver.familyName}">
                    <div class="f1-card-bottom text-white-50 small font-noto position-relative z-4">
                        <span><i class="fa-solid fa-earth-americas me-1"></i>${d.Driver.nationality}</span>
                    </div>
                </div>
            </div>
        `);
    });

    document.getElementById('m-season-pos').innerText = seasonData ? `${seasonData.position}위` : "-";
    document.getElementById('m-season-pts').innerText = seasonData ? `${seasonData.points} 점` : "0 점";
    document.getElementById('m-season-wins').innerText = `${currentWins} 회`;
    document.getElementById('m-season-pods').innerText = `${currentPods} 회`;
    document.getElementById('m-hist-entered').innerText = `${totalCombinedEntered} 경기`;
    document.getElementById('m-hist-pts').innerText = totalCombinedPoints;
    document.getElementById('m-hist-highest').innerText = db.highest;
    document.getElementById('m-hist-pods').innerText = `${totalCombinedPods} 회`;
    document.getElementById('m-hist-poles').innerText = `${db.poles} 회`;
    document.getElementById('m-hist-champs').innerText = `${db.titles} 회`;

    const teamModal = new bootstrap.Modal(document.getElementById('teamDetailModal'));
    teamModal.show();
}