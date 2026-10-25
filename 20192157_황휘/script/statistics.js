// ----------------------------------------------------
// 서브 페이지: 통계 대시보드 차트 생성 (statistics.js)
// ----------------------------------------------------

// 등번호 로고 → getNumberImageUrl (common.js)

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

        // 시즌 전체 경기 결과로 만드는 자세한 분석 (실패해도 위 그래프 3개는 그대로 보임)
        loadSeasonDetails(currentAutoYear, drivers).catch(e => console.error("시즌 상세 통계 로드 실패:", e));

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

// ====================================================
// 시즌 상세 분석: 핵심 지표 · 포인트 추이 · 포디움 · 순위 상승 · 팀 동료 대결 · 기록 표
// ====================================================
const teamColorOf = (constructorName) => (teamData[getCleanTeamName(constructorName)] || teamData["default"]).color;

// 결과 API는 한 번에 100줄까지만 주므로 나눠서 동시에 받는다 (경기당 약 22줄 → 시즌 약 400줄)
async function fetchAllPages(path, pages) {
    const lists = await Promise.all(Array.from({ length: pages }, (_, i) =>
        fetch(`${JOLPICA_BASE_URL}/${path}.json?limit=100&offset=${i * 100}`).then(r => r.json())
            .then(d => d.MRData.RaceTable.Races).catch(() => [])));
    // 페이지 경계에서 같은 경기가 두 번 나올 수 있어 라운드별로 합친다
    const byRound = {};
    lists.flat().forEach(race => {
        const key = race.round;
        const rows = race.Results || race.SprintResults || race.QualifyingResults || [];
        if (!byRound[key]) byRound[key] = { ...race, rows: [] };
        byRound[key].rows.push(...rows);
    });
    return Object.values(byRound).sort((a, b) => Number(a.round) - Number(b.round));
}

async function loadSeasonDetails(year, standings) {
    const [races, sprints, poles, schedule] = await Promise.all([
        fetchAllPages(`${year}/results`, 5),
        fetchAllPages(`${year}/sprint`, 2),
        fetchAllPages(`${year}/qualifying/1`, 1),
        fetch(`${JOLPICA_BASE_URL}/${year}.json?limit=40`).then(r => r.json()).then(d => d.MRData.RaceTable.Races.length).catch(() => 0),
    ]);
    if (races.length === 0) return;

    // 드라이버별 기록 모으기
    const stat = {};
    const get = (r) => stat[r.Driver.driverId] = stat[r.Driver.driverId] || {
        id: r.Driver.driverId, name: r.Driver.familyName, given: r.Driver.givenName, number: r.Driver.permanentNumber,
        team: r.Constructor.name, starts: 0, wins: 0, p2: 0, p3: 0, poles: 0, fastest: 0, dnf: 0, finishSum: 0, finished: 0,
        gained: 0, gainedRaces: 0, pointsByRound: {}, best: 99,
    };
    races.forEach(race => race.rows.forEach(r => {
        const d = get(r);
        d.team = r.Constructor.name;  // 가장 최근 팀
        d.starts++;
        const pos = Number(r.position);
        if (r.positionText === "1") d.wins++;
        if (r.positionText === "2") d.p2++;
        if (r.positionText === "3") d.p3++;
        if (r.FastestLap && r.FastestLap.rank === "1") d.fastest++;
        const classified = /^\d+$/.test(r.positionText);  // 'R'(리타이어)·'D'(실격)·'W'(기권)는 숫자가 아님
        if (!classified) d.dnf++;
        else {
            d.finishSum += pos; d.finished++; d.best = Math.min(d.best, pos);
            const grid = Number(r.grid);
            if (grid > 0) { d.gained += grid - pos; d.gainedRaces++; }
        }
        d.pointsByRound[race.round] = (d.pointsByRound[race.round] || 0) + Number(r.points);
    }));
    sprints.forEach(sp => sp.rows.forEach(r => {
        const d = get(r);
        d.pointsByRound[sp.round] = (d.pointsByRound[sp.round] || 0) + Number(r.points);
    }));
    poles.forEach(q => {
        const pole = q.rows.find(r => r.position === "1");
        if (pole) get(pole).poles++;
    });

    const list = Object.values(stat);
    const standingPts = Object.fromEntries(standings.map(s => [s.Driver.driverId, Number(s.points)]));
    list.forEach(d => {
        d.points = standingPts[d.id] ?? Object.values(d.pointsByRound).reduce((a, b) => a + b, 0);
        d.podiums = d.wins + d.p2 + d.p3;
        d.avgFinish = d.finished ? d.finishSum / d.finished : null;
        d.avgGain = d.gainedRaces ? d.gained / d.gainedRaces : 0;
    });

    renderKpis(list, races, schedule);
    renderProgressChart(list, races);
    renderPodiumChart(list);
    renderGainChart(list);
    renderTeammates(list);
    renderStatsTable(list);
}

function renderKpis(list, races, totalRounds) {
    const top = (key) => [...list].sort((a, b) => b[key] - a[key])[0];
    const winners = list.filter(d => d.wins > 0).length;
    const starts = list.reduce((a, d) => a + d.starts, 0);
    const dnfs = list.reduce((a, d) => a + d.dnf, 0);
    const mostWins = top("wins"), mostPoles = top("poles"), mostPodiums = top("podiums"), mostFastest = top("fastest");
    const kpis = [
        { label: "진행 경기", value: races.length, unit: totalRounds ? `/ ${totalRounds}` : "", sub: `${races[races.length - 1].raceName.replace(" Grand Prix", " GP")}까지`, color: "#e10600" },
        { label: "서로 다른 우승자", value: winners, unit: "명", sub: winners > 4 ? "치열한 시즌" : "독주 체제", color: "#ffd166" },
        { label: "최다 우승", value: mostWins.wins, unit: "승", sub: mostWins.name, color: teamColorOf(mostWins.team) },
        { label: "최다 폴 포지션", value: mostPoles.poles, unit: "회", sub: mostPoles.name, color: teamColorOf(mostPoles.team) },
        { label: "최다 포디움", value: mostPodiums.podiums, unit: "회", sub: mostPodiums.name, color: teamColorOf(mostPodiums.team) },
        { label: "완주율", value: Math.round((1 - dnfs / starts) * 100), unit: "%", sub: `리타이어 ${dnfs}회 · 최다 패스티스트 랩 ${mostFastest.name}`, color: "#27F4D2" },
    ];
    document.getElementById('kpi-grid').innerHTML = kpis.map(k => `
        <div class="kpi" style="--kpi-color: ${k.color};">
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value">${k.value}<small>${k.unit}</small></div>
            <div class="kpi-sub" title="${k.sub}">${k.sub}</div>
        </div>`).join('');
}

function renderProgressChart(list, races) {
    const top = [...list].sort((a, b) => b.points - a.points).slice(0, 6);
    const rounds = races.map(r => r.round);
    new Chart(document.getElementById('progressChart'), {
        type: 'line',
        data: {
            labels: races.map(r => r.raceName.replace(" Grand Prix", "").replace("Grand Prix", "").trim()),
            datasets: top.map(d => {
                let sum = 0;
                const color = teamColorOf(d.team);
                // 같은 팀 두 번째 드라이버는 점선으로 구분
                const dashed = top.filter(o => o.team === d.team).indexOf(d) === 1;
                return {
                    label: `${d.number || ""} ${d.name}`.trim(),
                    data: rounds.map(r => (sum += d.pointsByRound[r] || 0)),
                    borderColor: color, backgroundColor: color, borderWidth: 3, tension: 0.3,
                    pointRadius: 2, pointHoverRadius: 6, borderDash: dashed ? [6, 5] : [],
                };
            }),
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 18 } },
                tooltip: { itemSort: (a, b) => b.parsed.y - a.parsed.y } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.08)' } },
                x: { grid: { display: false }, ticks: { maxRotation: 50, minRotation: 30, font: { size: 11 } } },
            },
        },
    });
}

function renderPodiumChart(list) {
    const top = list.filter(d => d.podiums > 0).sort((a, b) => b.podiums - a.podiums || b.wins - a.wins).slice(0, 10);
    new Chart(document.getElementById('podiumChart'), {
        type: 'bar',
        data: {
            labels: top.map(d => d.name),
            datasets: [
                { label: '우승', data: top.map(d => d.wins), backgroundColor: '#FFD166' },
                { label: '2위', data: top.map(d => d.p2), backgroundColor: '#C0C7D1' },
                { label: '3위', data: top.map(d => d.p3), backgroundColor: '#CD7F32' },
            ],
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { x: { stacked: true, grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { precision: 0 } },
                      y: { stacked: true, grid: { display: false }, ticks: { font: { weight: 'bold' } } } },
        },
    });
}

function renderGainChart(list) {
    // 5경기 이상 완주한 드라이버만 (한두 경기로 평균이 튀지 않게)
    const eligible = list.filter(d => d.gainedRaces >= 5).sort((a, b) => b.avgGain - a.avgGain);
    const shown = [...eligible.slice(0, 6), ...eligible.slice(-4)].filter((d, i, arr) => arr.indexOf(d) === i);
    new Chart(document.getElementById('gainChart'), {
        type: 'bar',
        data: {
            labels: shown.map(d => d.name),
            datasets: [{
                label: '평균 순위 변화',
                data: shown.map(d => Number(d.avgGain.toFixed(2))),
                backgroundColor: shown.map(d => d.avgGain >= 0 ? 'rgba(46, 204, 113, 0.85)' : 'rgba(231, 76, 60, 0.85)'),
                borderRadius: 4,
            }],
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false },
                tooltip: { callbacks: { label: (c) => `경기당 ${c.parsed.x > 0 ? "+" : ""}${c.parsed.x}계단 (${shown[c.dataIndex].gainedRaces}경기 완주)` } } },
            scales: { x: { grid: { color: 'rgba(255,255,255,0.08)' }, title: { display: true, text: '경기당 평균 순위 상승 (+) / 하락 (−)' } },
                      y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } },
        },
    });
}

function renderTeammates(list) {
    // 팀마다 가장 많이 출전한 두 명 (대체 출전 드라이버는 빠짐)
    const byTeam = {};
    list.forEach(d => (byTeam[d.team] = byTeam[d.team] || []).push(d));
    const rows = Object.entries(byTeam).map(([team, ds]) => {
        const pair = ds.sort((a, b) => b.starts - a.starts).slice(0, 2).sort((a, b) => b.points - a.points);
        return { team, pair, total: pair.reduce((a, d) => a + d.points, 0) };
    }).filter(r => r.pair.length === 2).sort((a, b) => b.total - a.total);

    document.getElementById('teammate-grid').innerHTML = rows.map(({ team, pair: [a, b], total }) => {
        const color = teamColorOf(team);
        const share = total ? a.points / total * 100 : 50;
        return `
            <div class="tm-row">
                <div class="tm-team" style="color: ${color};">${team.toUpperCase()}</div>
                <div class="tm-names"><span><b>${a.name}</b> ${a.points}점</span><span>${b.points}점 <b>${b.name}</b></span></div>
                <div class="tm-bar"><i style="width: ${share}%; background: ${color};"></i><i style="width: ${100 - share}%; background: ${color};"></i></div>
                <div class="tm-sub"><span>${Math.round(share)}% · 우승 ${a.wins} · 포디움 ${a.podiums}</span><span>우승 ${b.wins} · 포디움 ${b.podiums} · ${Math.round(100 - share)}%</span></div>
            </div>`;
    }).join('') || '<p class="text-white-50">데이터가 없습니다.</p>';
}

function renderStatsTable(list) {
    const cols = [
        { key: "points", label: "포인트" }, { key: "wins", label: "우승" }, { key: "podiums", label: "포디움" },
        { key: "poles", label: "폴" }, { key: "fastest", label: "패스티스트 랩" }, { key: "best", label: "최고 순위", asc: true },
        { key: "avgFinish", label: "평균 완주 순위", asc: true }, { key: "dnf", label: "리타이어", asc: true }, { key: "starts", label: "출전", noBest: true },
    ];
    let sortKey = "points", asc = false;
    const table = document.getElementById('stats-table');
    const fmt = (d, key) => key === "avgFinish" ? (d.avgFinish ? d.avgFinish.toFixed(1) : "-") : key === "best" ? (d.best < 99 ? `${d.best}위` : "-") : d[key];

    const draw = () => {
        const rows = [...list].sort((a, b) => {
            const va = a[sortKey] ?? 99, vb = b[sortKey] ?? 99;
            return asc ? va - vb : vb - va;
        });
        // 열마다 가장 좋은 기록은 금색
        const bestOf = Object.fromEntries(cols.map(c => {
            const vals = list.map(d => d[c.key]).filter(v => v !== null && v !== 99);
            return [c.key, c.asc ? Math.min(...vals) : Math.max(...vals)];
        }));
        table.innerHTML = `
            <thead><tr><th data-key="rank">#</th><th>드라이버</th>${cols.map(c => `<th data-key="${c.key}" class="text-end ${c.key === sortKey ? `sorted ${asc ? "asc" : ""}` : ""}">${c.label}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((d, i) => {
                const num = getNumberImageUrl(d.id);
                return `<tr>
                    <td class="text-white-50">${i + 1}</td>
                    <td><span class="d-inline-flex align-items-center gap-2">
                        <span style="width: 4px; height: 22px; background: ${teamColorOf(d.team)}; border-radius: 2px;"></span>
                        ${num ? `<img class="num-img" src="${num}" alt="${d.number || ""}" referrerpolicy="no-referrer">` : `<b style="color: ${teamColorOf(d.team)}; width: 32px;">${d.number || ""}</b>`}
                        <span><b>${d.name.toUpperCase()}</b> <small class="text-white-50">${getCleanTeamName(d.team)}</small></span>
                    </span></td>
                    ${cols.map(c => `<td class="text-end ${!c.noBest && d[c.key] === bestOf[c.key] && d[c.key] !== 0 ? "best" : ""}">${fmt(d, c.key)}</td>`).join('')}
                </tr>`;
            }).join('')}</tbody>`;
        table.querySelectorAll('th[data-key]').forEach(th => th.addEventListener('click', () => {
            const key = th.dataset.key;
            if (key === "rank") return;
            const col = cols.find(c => c.key === key);
            if (sortKey === key) asc = !asc; else { sortKey = key; asc = !!col.asc; }
            draw();
        }));
    };
    draw();
}
