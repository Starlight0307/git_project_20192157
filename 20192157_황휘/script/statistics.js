// ----------------------------------------------------
// 서브 페이지: 통계 대시보드 차트 생성 (statistics.js)
// ----------------------------------------------------

// 등번호 로고 
const getNumberImageUrl = (driverId) => {
    const numberMap = {
    "max_verstappen": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01numberwhitefrless.webp",
    "hadjar": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01numberwhitefrless.webp",
    
    // Mercedes
    "russell": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01numberwhitefrless.webp",
    "antonelli": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01numberwhitefrless.webp",
    
    // Ferrari
    "leclerc": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01numberwhitefrless.webp",
    "hamilton": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01numberwhitefrless.webp",
    
    // McLaren
    "norris": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01numberwhitefrless.webp",
    "piastri": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01numberwhitefrless.webp",
    
    // Aston Martin
    "alonso": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01numberwhitefrless.webp",
    "stroll": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01numberwhitefrless.webp",
    
    // Alpine
    "gasly": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01numberwhitefrless.webp",
    "colapinto": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01numberwhitefrless.webp",
    
    // Williams
    "albon": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01numberwhitefrless.webp",
    "sainz": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01numberwhitefrless.webp",
    
    // Racing Bulls (RB) 
    "lawson": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01numberwhitefrless.webp",
    "arvid_lindblad": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01numberwhitefrless.webp", 
    
    // Haas
    "ocon": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01numberwhitefrless.webp",
    "bearman": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01numberwhitefrless.webp",
    
    // Audi (Kick Sauber)
    "hulkenberg": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01numberwhitefrless.webp",
    "bortoleto": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01numberwhitefrless.webp",

    // Cadillac 
    "perez": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01numberwhitefrless.webp",
    "bottas": "https://media.formula1.com/image/upload/c_fit,w_876,h_742/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01numberwhitefrless.webp",
    };

    return numberMap[driverId] || "";
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('statistics-content')) {
        initStatistics();
    }
});

async function initStatistics() {
    const currentAutoYear = new Date().getFullYear(); 
    
    try {
        const [driverRes, teamRes] = await Promise.all([
            fetch(`${JOLPICA_BASE_URL}/${currentAutoYear}/driverStandings.json`),
            fetch(`${JOLPICA_BASE_URL}/${currentAutoYear}/constructorStandings.json`)
        ]);

        const driverData = await driverRes.json();
        const teamDataRes = await teamRes.json();

        const drivers = driverData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        const teams = teamDataRes.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('statistics-content').classList.remove('d-none');

        Chart.defaults.color = '#e0e0e0';
        Chart.defaults.font.family = "'Urbanist', 'Noto Sans KR', sans-serif";
        Chart.defaults.font.size = 14; 

        renderDriverChart(drivers);
        renderTeamChart(teams);
        renderWinsChart(drivers);

    } catch (error) {
        console.error("통계 데이터 로드 실패:", error);
        document.getElementById('loading-spinner').innerHTML = `<div class="alert alert-danger fw-bold">데이터를 불러오는 데 실패했습니다. 통신 상태를 확인해주세요.</div>`;
    }
}

const numberLogoPlugin = {
    id: 'numberLogoPlugin',
    afterDatasetsDraw(chart, args, options) {
        const { ctx, data } = chart;
        const meta = chart.getDatasetMeta(0);
        
        meta.data.forEach((bar, index) => {
            const img = data.customImages[index];
            // 이미지가 로드된 상태일 경우 캔버스 위에 그려줍니다.
            if (img && img.complete && img.naturalHeight !== 0) {
                const imgWidth = 50; // 등번호 이미지 너비
                const imgHeight = 45; // 등번호 이미지 높이
                const x = bar.x - (imgWidth / 2);
                const y = bar.y - imgHeight - 8; // 막대그래프 상단에서 8px 위로 띄움
                
                // 어두운 배경에서 이미지가 잘 보이게 하얀색 후광(Glow) 추가
                ctx.save();
                ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
                ctx.shadowBlur = 8;
                ctx.drawImage(img, x, y, imgWidth, imgHeight);
                ctx.restore();
            } else if (img && !img.complete) {
                img.onload = () => chart.update();
            }
        });
    }
};

// 드라이버 포인트 막대 그래프
function renderDriverChart(drivers) {
    const ctx = document.getElementById('driverPointsChart').getContext('2d');
    
    const topDrivers = drivers.slice(0, 10);
    
    const labels = topDrivers.map(d => `${d.Driver.permanentNumber || ''} ${d.Driver.familyName}`.trim());
    const dataPoints = topDrivers.map(d => parseInt(d.points));
    
    const bgColors = topDrivers.map(d => {
        const teamName = getCleanTeamName(d.Constructors[0].name);
        return (teamData[teamName] || teamData["default"]).color;
    });

    const customImages = topDrivers.map(d => {
        const url = getNumberImageUrl(d.Driver.driverId);
        if (url) {
            const img = new Image();
            img.referrerPolicy = "no-referrer";
            img.src = url;
            return img;
        }
        return null;
    });

    new Chart(ctx, {
        type: 'bar',
        plugins: [numberLogoPlugin],
        data: {
            labels: labels,
            customImages: customImages, 
            datasets: [{
                label: '포인트',
                data: dataPoints,
                backgroundColor: bgColors,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 60 } 
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { font: { size: 14 } } 
                },
                x: { 
                    grid: { display: false },
                    ticks: { font: { size: 15, weight: 'bold' } }
                }
            }
        }
    });
}

// 스트럭터 포인트 도넛 그래프
function renderTeamChart(teams) {
    const ctx = document.getElementById('teamPointsChart').getContext('2d');
    
    const labels = teams.map(t => t.Constructor.name);
    const dataPoints = teams.map(t => parseInt(t.points));
    const bgColors = teams.map(t => {
        const teamName = getCleanTeamName(t.Constructor.name);
        return (teamData[teamName] || teamData["default"]).color;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#1e1e23'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: { 
                    position: 'right',
                    // 팀이 11개라 글자·간격이 크면 두 줄로 넘어가 오른쪽이 잘림 → 한 줄에 다 들어가게
                    labels: { font: { size: 13 }, padding: 10, boxWidth: 14 }
                }
            }
        }
    });
}

// 우승 비율 파이 그래프
function renderWinsChart(drivers) {
    const ctx = document.getElementById('winsChart').getContext('2d');
    
    const winners = drivers.filter(d => parseInt(d.wins) > 0);
    
    if (winners.length === 0) {
        ctx.font = "18px 'Noto Sans KR'";
        ctx.fillStyle = "#e0e0e0";
        ctx.textAlign = "center";
        ctx.fillText("아직 기록된 우승 데이터가 없습니다.", ctx.canvas.width/2, ctx.canvas.height/2);
        return;
    }

    const labels = winners.map(d => `${d.Driver.permanentNumber || ''} ${d.Driver.familyName}`.trim());
    const dataWins = winners.map(d => parseInt(d.wins));
    const bgColors = winners.map(d => {
        const teamName = getCleanTeamName(d.Constructors[0].name);
        return (teamData[teamName] || teamData["default"]).color;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dataWins,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#1e1e23'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: { font: { size: 15 }, padding: 20 }
                }
            }
        }
    });
}