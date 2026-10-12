// ----------------------------------------------------
// 서브 페이지: 일정/결과 동적 로드 (schedule.html)
// ----------------------------------------------------

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.status === 429) { 
                console.warn("API 요청 한계 도달! 1초 대기 후 안전하게 재시도합니다...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

async function fetchFullScheduleAndResults(year) {
    const container = document.getElementById('full-schedule-container');
    if (!container) return;
    
    container.innerHTML = '<div class="col-12 text-center text-white-50 py-5"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i><p>일정과 경기 결과를 불러오는 중입니다...</p></div>';
    
    try {
        const noCache = `&t=${new Date().getTime()}`;
        
        const scheduleRes = await fetchWithRetry(`${JOLPICA_BASE_URL}/${year}.json?limit=100${noCache}`);
        const scheduleData = await scheduleRes.json();
        const races = scheduleData.MRData.RaceTable.Races || [];
        
        // 화면에는 1~3위만 보여주므로 1·2·3위 결과만 받는다(3번을 동시에 → 전체 결과를 100줄씩 여러 번 받는 것보다 훨씬 빠름)
        const resultRaces = [];
        const podiumLists = await Promise.all([1, 2, 3].map(async (pos) => {
            const res = await fetchWithRetry(`${JOLPICA_BASE_URL}/${year}/results/${pos}.json?limit=100${noCache}`);
            const data = await res.json();
            return data.MRData.RaceTable.Races || [];
        }));
        podiumLists.flat().forEach(fetchedRace => {
            const existingRace = resultRaces.find(r => String(r.round) === String(fetchedRace.round));
            if (existingRace) {
                existingRace.Results = existingRace.Results.concat(fetchedRace.Results);
            } else {
                resultRaces.push({ ...fetchedRace, Results: [...fetchedRace.Results] });
            }
        });
        
        container.innerHTML = '';
        
        races.forEach(race => {
            const matchedResult = resultRaces.find(r => String(r.round) === String(race.round));
            let podiumHTML = '<span class="text-white-50 fst-italic">경기 예정</span>';
            
            if (matchedResult && matchedResult.Results && matchedResult.Results.length >= 3) {
                const sortedResults = matchedResult.Results.sort((a, b) => parseInt(a.position) - parseInt(b.position));
                
                podiumHTML = `
                    <div class="d-flex gap-3 text-white">
                        <span>🏆 ${sortedResults[0].Driver.familyName}</span>
                        <span>🥈 ${sortedResults[1].Driver.familyName}</span>
                        <span>🥉 ${sortedResults[2].Driver.familyName}</span>
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
            
            let bgUrl = "";
            if (typeof heroImages !== 'undefined') {
                if (heroImages[cId] && heroImages[cId].trim() !== "") {
                    bgUrl = heroImages[cId];
                } else {
                    bgUrl = heroImages["default"];
                }
            }

            container.insertAdjacentHTML('beforeend', `
                <div class="col-12 mb-3">
                    <div class="glass-card d-flex flex-column flex-md-row align-items-md-center overflow-hidden" style="background: rgba(30, 30, 35, 0.8);">
                        <div class="flex-shrink-0" style="width: 100%; max-width: 250px; height: 120px; background: #222 url('${bgUrl}') center/cover no-repeat;"></div>
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
        console.error("일정/결과 로드 에러:", error);
        container.innerHTML = '<div class="col-12 text-center text-danger">데이터 로드 실패: 통신 상태를 확인해주세요.</div>'; 
    }
}