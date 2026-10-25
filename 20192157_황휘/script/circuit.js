// ----------------------------------------------------
// F1 서킷 가이드 페이지 전용 로직
// ----------------------------------------------------

function getF1OfficialUrl(year, circuitId, country) {
    const slugMap = {
        "albert_park": "australia", "bahrain": "bahrain", "shanghai": "china", 
        "suzuka": "japan", "jeddah": "saudi_arabia", "miami": "miami", 
        "imola": "emiliaromagna", "monaco": "monaco", "catalunya": "spain", 
        "madrid": "spain", "villeneuve": "canada", "red_bull_ring": "austria", 
        "silverstone": "great_britain", "spa": "belgium", "hungaroring": "hungary", 
        "zandvoort": "netherlands", "monza": "italy", "baku": "azerbaijan", 
        "marina_bay": "singapore", "americas": "united_states", "rodriguez": "mexico", 
        "interlagos": "brazil", "vegas": "las_vegas", "losail": "qatar", "yas_marina": "abu_dhabi",
        "yeongam": "south_korea", "buddh": "india", "valencia": "europe", "hockenheimring": "germany", 
        "nurburgring": "germany", "istanbul": "turkey", "sepang": "malaysia", "sochi": "russia", 
        "portimao": "portugal", "mugello": "tuscan", "ricard": "france"
    };
    
    const slug = slugMap[circuitId] || country.toLowerCase().replace(/\s+/g, '_');
    return `https://www.formula1.com/en/racing/${year}/${slug}`;
}

async function renderCircuitGuideData(year) {
    const container = document.getElementById('circuit-guide-container');
    if (!container) return;

    try {
        const res = await fetch(`${JOLPICA_BASE_URL}/${year}.json?limit=100`);
        const data = await res.json();
        const races = data.MRData.RaceTable.Races;
        
        container.innerHTML = '';
        resetCircuitMap();
        
        races.forEach(race => {
            let cId = race.Circuit.circuitId;
            let cName = race.Circuit.circuitName;
            
            if (year === "2026" && (cId === "catalunya" || cName.includes("Madri") || race.Circuit.Location.locality === "Madrid")) {
                cId = "madrid";
                cName = "MADRING"; 
            }

            const guide = circuitGuidesData[cId] || { corners: "?", ot_zone_2026: "데이터 수집 중입니다.", drs_zone: "데이터 수집 중입니다.", features: "해당 연도의 서킷 상세 데이터가 준비 중입니다." };
            
            let bgUrl = "";
            if (typeof heroImages !== 'undefined') {
                if (heroImages[cId] && heroImages[cId].trim() !== "") {
                    bgUrl = heroImages[cId];
                } else {
                    bgUrl = heroImages["default"];
                }
            }
            
            const f1Url = getF1OfficialUrl(year, cId, race.Circuit.Location.country);
            addCircuitMarker(race, cId, cName);
            
            let otLabel = "";
            let otText = "";
            const numYear = parseInt(year);
            
            if (numYear >= 2026) {
                otLabel = '<i class="fa-solid fa-bolt text-warning me-2"></i>2026 규정: AO / OT 구간';
                otText = guide.ot_zone_2026 || "데이터 수집 중입니다.";
            } else if (numYear >= 2011) {
                otLabel = '<i class="fa-solid fa-gauge-high text-info me-2"></i>DRS 존 및 주요 추월 구간';
                otText = guide.drs_zone || "데이터 수집 중입니다.";
            } else {
                otLabel = '<i class="fa-solid fa-flag-checkered text-white me-2"></i>클래식 추월(OT) 포인트';
                otText = guide.ot_zone_2026 || "데이터 수집 중입니다."; 
            }
            
            container.insertAdjacentHTML('beforeend', `
                <div class="col-md-6 col-xl-4 mb-4">
                    <div class="glass-card overflow-hidden h-100 d-flex flex-column" style="background: rgba(30, 30, 35, 0.8); cursor: pointer;" onclick="window.open('${f1Url}', '_blank')">
                        <div style="height: 180px; width: 100%; background: #222 url('${bgUrl}') center/cover no-repeat; flex-shrink: 0;"></div>
                        <div class="p-4 d-flex flex-column flex-grow-1">
                            <h4 class="fw-black text-white mb-1 d-flex justify-content-between align-items-center">
                                ${cName} 
                                <i class="fa-solid fa-arrow-up-right-from-square text-white-50" style="font-size: 0.9rem;"></i>
                            </h4>
                            <p class="text-danger fw-bold small mb-3"><i class="fa-solid fa-location-dot me-1"></i>${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</p>
                            
                            <div class="text-white-75 mb-3">
                                <span class="badge border border-secondary bg-dark text-white me-1 mb-1">코너: ${guide.corners}개</span>
                                <span class="badge border border-secondary bg-dark text-white mb-1">${year} 시즌 ${race.round}R</span>
                                <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2 mb-1 ms-1" onclick="event.stopPropagation(); showCircuitOnMap('${cId}')">
                                    <i class="fa-solid fa-map-location-dot me-1"></i>지도에서 보기
                                </button>
                            </div>
                            
                            <div class="mb-3">
                                <strong class="text-white d-block mb-1">${otLabel}</strong>
                                <p class="text-white-50 small m-0" style="line-height: 1.5;">${otText}</p>
                            </div>
                            
                            <div class="mt-auto pt-3 border-top border-secondary">
                                <strong class="text-white d-block mb-1"><i class="fa-solid fa-road text-white me-2"></i>서킷 특징</strong>
                                <p class="text-white-50 small m-0" style="line-height: 1.5;">${guide.features}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
        fitAllCircuits();
    } catch (e) { 
        console.error("서킷 데이터 로드 에러:", e); 
        container.innerHTML = '<div class="col-12 text-center text-danger">서킷 데이터를 불러오는 데 실패했습니다.</div>'; 
    }
}

// ----------------------------------------------------
// 그랑프리 개최지 지도 (Leaflet + OpenStreetMap)
// ----------------------------------------------------
// 선택한 시즌의 모든 서킷을 라운드 번호 표시로 띄우고,
// 표시·드롭다운·카드의 '지도에서 보기'를 누르면 그 위치로 이동한다.
let circuitMap = null;
const circuitMarkers = {};   // circuitId → Leaflet 표시

// escapeHtml → common.js

function getCircuitMap() {
    if (circuitMap) return circuitMap;
    const el = document.getElementById('circuit-map');
    if (!el || typeof L === 'undefined') return null;   // 지도 라이브러리를 못 불러오면 지도만 빼고 동작

    circuitMap = L.map(el, { worldCopyJump: true, scrollWheelZoom: false }).setView([25, 10], 2);
    // OpenStreetMap 지도 (사이트 분위기에 맞게 CSS로 어둡게 바꿈 → style.css의 .circuit-map)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(circuitMap);
    // 지도를 한 번 누른 뒤에만 마우스 휠로 확대 (페이지 스크롤을 방해하지 않게)
    circuitMap.on('click', () => circuitMap.scrollWheelZoom.enable());
    circuitMap.on('mouseout', () => circuitMap.scrollWheelZoom.disable());

    const select = document.getElementById('circuit-map-select');
    if (select) select.addEventListener('change', () => { if (select.value) showCircuitOnMap(select.value, false); });
    const allBtn = document.getElementById('circuit-map-all');
    if (allBtn) allBtn.addEventListener('click', fitAllCircuits);
    return circuitMap;
}

function resetCircuitMap() {
    const map = getCircuitMap();
    Object.keys(circuitMarkers).forEach(id => {
        if (map) map.removeLayer(circuitMarkers[id]);
        delete circuitMarkers[id];
    });
    const select = document.getElementById('circuit-map-select');
    if (select) select.length = 1;   // '그랑프리를 선택하세요'만 남김
}

function addCircuitMarker(race, cId, cName) {
    const map = getCircuitMap();
    const lat = parseFloat(race.Circuit.Location.lat);
    const lng = parseFloat(race.Circuit.Location.long);
    if (!map || Number.isNaN(lat) || Number.isNaN(lng)) return;

    const loc = race.Circuit.Location;
    const icon = L.divIcon({
        className: 'circuit-marker',
        html: `<span>${escapeHtml(race.round)}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
    const date = race.date ? race.date.replaceAll('-', '.') : '';
    const marker = L.marker([lat, lng], { icon, title: race.raceName })
        .addTo(map)
        .bindPopup(`
            <div class="circuit-popup">
                <small>ROUND ${escapeHtml(race.round)} · ${escapeHtml(date)}</small>
                <strong>${escapeHtml(race.raceName)}</strong>
                <span>${escapeHtml(cName)}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(loc.locality)}, ${escapeHtml(loc.country)}</span>
                <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">구글 지도에서 열기 ↗</a>
            </div>`);
    circuitMarkers[cId] = marker;

    const select = document.getElementById('circuit-map-select');
    if (select) select.add(new Option(`R${race.round}. ${race.raceName}`, cId));
}

function fitAllCircuits() {
    const map = getCircuitMap();
    const markers = Object.values(circuitMarkers);
    if (!map || markers.length === 0) return;
    map.closePopup();
    map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [30, 30], maxZoom: 5 });
    const select = document.getElementById('circuit-map-select');
    if (select) select.value = '';
}

function showCircuitOnMap(cId, scroll = true) {
    const map = getCircuitMap();
    const marker = circuitMarkers[cId];
    if (!map || !marker) return;
    if (scroll) document.getElementById('circuit-map-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    map.flyTo(marker.getLatLng(), 13, { duration: 1.2 });
    map.once('moveend', () => marker.openPopup());
    const select = document.getElementById('circuit-map-select');
    if (select) select.value = cId;
}
