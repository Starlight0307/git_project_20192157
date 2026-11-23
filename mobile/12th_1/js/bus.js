// =============================================================
// bus.js : 경기도 버스 도착정보 화면을 움직이는 스크립트
// 순서: ① 기본 설정 → ② API 불러오기 → ③ 자료 정리 → ④ 정류소 검색
//       → ⑤ 도착정보 → ⑥ 자동 새로고침·카운트다운 → ⑦ 즐겨찾기 → ⑧ 공통 도우미 → ⑨ 시작
// 자료 출처: 공공데이터포털 경기도_버스도착정보 조회 / 경기도_정류소 조회
// =============================================================

// ===== ① 기본 설정 =====

// 경기도 버스 API 기본 주소
const BUS_API_BASE = 'https://apis.data.go.kr/6410000';

// 자동 새로고침 간격(초) — 버스 위치 자료가 보통 30초 안팎으로 바뀜
// shortcut: 개발용 키는 하루 호출 수가 제한됨, 화면을 오래 켜 둘 일이 많으면 간격을 늘리거나 운영 키로 신청할 것
const REFRESH_SECONDS = 30;

// 노선 종류 번호 → [화면에 보일 이름, 색 이름]
const ROUTE_TYPES = {
  11: ['직행좌석', 'red'], 12: ['좌석', 'blue'], 13: ['일반', 'green'], 14: ['광역급행', 'red'],
  15: ['따복', 'purple'], 16: ['순환', 'yellow'], 21: ['농어촌직행', 'red'], 22: ['농어촌좌석', 'blue'],
  23: ['농어촌', 'green'], 30: ['마을', 'yellow'], 41: ['고속', 'gray'], 42: ['시외좌석', 'gray'],
  43: ['시외일반', 'gray'], 51: ['공항리무진', 'sky'], 52: ['공항좌석', 'sky'], 53: ['공항일반', 'sky']
};

// 남은 좌석 수가 의미 있는 노선 종류 (일반·마을버스는 좌석 수를 보여주지 않음)
const SEAT_ROUTE_TYPES = [11, 12, 14, 21, 22, 41, 42, 51, 52];

// 혼잡도 번호 → 이름
const CROWD_NAMES = { 1: '여유', 2: '보통', 3: '혼잡', 4: '매우혼잡' };

// 운행 상태 → 이름 (도착 예정 버스가 없을 때 보여줌)
const FLAG_NAMES = { PASS: '도착 예정 버스 없음', STOP: '운행 종료', WAIT: '회차지에서 대기 중' };

// 브라우저 저장소 이름 (즐겨찾기·마지막으로 본 정류소)
const FAVORITES_KEY = 'gg-bus-favorites';
const LAST_STATION_KEY = 'gg-bus-last-station';

// 지금 보고 있는 정류소 { stationId, stationName, mobileNo }
let currentStation = null;
// 마지막으로 성공한 도착정보 (갱신 실패 시 이전 자료를 계속 보여주기 위함)
let lastArrivals = null;
// 가장 최근 도착정보 요청 번호 (정류소를 빠르게 바꿀 때 늦게 온 옛 응답 무시)
let latestArrivalRequest = 0;
// 다음 자동 새로고침 예약 번호
let refreshTimer = null;
// 화면에 나온 정류소 모음 (정류소 번호 → 정류소 정보, 버튼·지도 표시를 눌렀을 때 찾아 씀)
const knownStations = new Map();
// 지금 결과 목록 (지도에 작은 점으로 표시)
let listedStations = [];
// 내 위치 (주변 찾기를 했을 때만) { latitude, longitude }
let myPosition = null;
// 지도와 지도 위 표시 묶음 (처음 정류소를 열 때 만듦)
let stationMap = null;
let mapMarkers = null;

// 화면에서 자주 쓰는 요소들
const stationList = document.getElementById('stationList');
const resultCard = document.getElementById('resultCard');
const resultSummary = document.getElementById('resultSummary');
const busList = document.getElementById('busList');
const arrivalMeta = document.getElementById('arrivalMeta');
const refreshButton = document.getElementById('refreshButton');
const favoriteButton = document.getElementById('favoriteButton');

// ===== ② API 불러오기 =====

// 경기도 버스 API를 호출하고 응답 본문(msgBody)을 돌려주는 함수 (결과 없음이면 null)
async function fetchBusApi(path, params) {
  // config.js 가 없거나 키가 비어 있으면 안내 오류
  if (typeof BUS_API_KEY === 'undefined' || !BUS_API_KEY) throw new Error('API 키가 없어요. js/config.example.js를 복사해 js/config.js를 만들고 키를 넣어주세요.');
  // 키는 이미 인코딩된 값이라 그대로 붙이고, 나머지 조건만 인코딩
  const url = `${BUS_API_BASE}${path}?serviceKey=${BUS_API_KEY}&format=json&${new URLSearchParams(params)}`;
  // 요청 (8초 안에 응답이 없으면 실패)
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  // 응답을 글자로 받음 (오류일 때 JSON이 아닌 경우가 있어서)
  const text = await response.text();
  // 키 문제는 알아보기 쉬운 말로 안내
  if (text.includes('SERVICE_KEY')) throw new Error('서비스키가 등록되지 않았거나 이 서비스의 활용신청이 안 된 키예요.');
  // 그 밖의 서버 오류
  if (!response.ok) throw new Error(`응답 오류 ${response.status}`);
  // JSON으로 변환 (형식이 깨져 있으면 실패)
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('응답 형식을 읽을 수 없어요.'); }
  // 처리 결과 코드 (0: 정상, 4: 결과 없음)
  const header = data.response?.msgHeader;
  // 결과 없음은 오류가 아니라 "빈 결과"
  if (header?.resultCode === 4) return null;
  // 그 밖의 코드는 서버가 준 안내로 실패 처리
  if (header?.resultCode !== 0) throw new Error(header?.resultMessage || '알 수 없는 응답이에요.');
  // 정상 본문 반환
  return data.response.msgBody;
}

// 정류소 이름으로 검색하는 함수
async function searchStations(keyword) {
  // 정류소 조회 API 호출
  const body = await fetchBusApi('/busstationservice/v2/getBusStationListv2', { keyword });
  // 화면용 모양으로 정리
  return toArray(body?.busStationList).map(convertStation);
}

// 좌표(경도 x, 위도 y) 주변의 정류소를 가까운 순으로 불러오는 함수
async function searchNearbyStations(longitude, latitude) {
  // 주변 정류소 조회 API 호출
  const body = await fetchBusApi('/busstationservice/v2/getBusStationAroundListv2', { x: longitude, y: latitude });
  // 화면용 모양으로 정리 후 거리순 정렬
  return toArray(body?.busStationAroundList).map(convertStation).sort((a, b) => a.distance - b.distance);
}

// 정류소 자료를 화면용 모양으로 바꾸는 함수 (정류소 번호 앞 공백 제거, 거리는 주변 조회에서만 옴)
function convertStation(station) {
  return {
    stationId: String(station.stationId),
    stationName: station.stationName,
    mobileNo: String(station.mobileNo ?? '').trim(),
    regionName: station.regionName,
    // 좌표 (x: 경도, y: 위도) — 지도 표시용
    x: Number(station.x) || null,
    y: Number(station.y) || null,
    distance: station.distance == null ? null : Number(station.distance)
  };
}

// 정류소에 도착 예정인 버스 목록을 불러오는 함수 (곧 오는 순서로 정렬)
async function fetchArrivals(stationId) {
  // 도착정보 API 호출
  const body = await fetchBusApi('/busarrivalservice/v2/getBusArrivalListv2', { stationId });
  // 노선마다 정리 후, 첫 버스가 빨리 오는 순 (도착 정보 없는 노선은 맨 뒤)
  return toArray(body?.busArrivalList).map(convertArrival).sort((a, b) => (a.buses[0]?.seconds ?? Infinity) - (b.buses[0]?.seconds ?? Infinity));
}

// ===== ③ 자료 정리 =====

// API가 결과가 하나면 배열 대신 객체 하나를 주는 경우가 있어서 항상 배열로 맞추는 함수
function toArray(value) {
  // 없으면 빈 배열, 배열이면 그대로, 하나면 배열로 감쌈
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

// 빈 값인지 확인 (API는 정보가 없으면 빈 문자열을 줌)
function isBlank(value) {
  return value === '' || value == null;
}

// 노선 하나의 도착정보를 화면용 모양으로 바꾸는 함수
function convertArrival(raw) {
  // 노선 종류 이름과 색 (모르는 종류면 "기타")
  const [typeName, color] = ROUTE_TYPES[raw.routeTypeCd] || ['기타', 'gray'];
  // 좌석 수를 보여줄 노선인지
  const showSeats = SEAT_ROUTE_TYPES.includes(raw.routeTypeCd);
  // 첫 번째·두 번째 버스 정리 (정보가 없는 버스는 빼기)
  const buses = [1, 2].map(n => {
    // 도착 예정 시간이 없으면 이 버스는 없음
    if (isBlank(raw[`predictTimeSec${n}`]) && isBlank(raw[`predictTime${n}`])) return null;
    // 남은 좌석 (-1 은 정보 없음)
    const seats = Number(raw[`remainSeatCnt${n}`]);
    // 화면에 쓸 버스 정보
    return {
      seconds: isBlank(raw[`predictTimeSec${n}`]) ? Number(raw[`predictTime${n}`]) * 60 : Number(raw[`predictTimeSec${n}`]),
      stopsAway: Number(raw[`locationNo${n}`]) || 0,
      currentStation: raw[`stationNm${n}`] || '',
      plateNo: raw[`plateNo${n}`] || '',
      lowFloor: Number(raw[`lowPlate${n}`]) === 1,
      doubleDecker: Number(raw[`lowPlate${n}`]) === 2,
      seats: showSeats && seats >= 0 ? seats : null,
      crowded: CROWD_NAMES[raw[`crowded${n}`]] || null
    };
  }).filter(Boolean);
  // 노선 정보 반환 (노선 번호는 숫자로 올 때도 있어서 글자로 통일)
  return { routeId: String(raw.routeId), routeName: String(raw.routeName), typeName, color, destination: raw.routeDestName || '', flag: raw.flag, buses };
}

// ===== ④ 정류소 검색 =====

// 검색 폼을 제출했을 때 실행되는 함수
async function handleSearchSubmit(event) {
  // 페이지 새로고침 막기
  event.preventDefault();
  // 검색어 (앞뒤 공백 제거)
  const keyword = document.getElementById('stationSearchInput').value.trim();
  // 비어 있으면 안내만
  if (!keyword) { showToast('정류소 이름을 입력해 주세요.'); return; }
  // 결과 카드 열고 로딩 표시
  showStationLoading(`'${keyword}' 찾는 중…`);
  try {
    // 정류소 검색
    const stations = await searchStations(keyword);
    // 결과 그리기 (없으면 안내)
    renderStationList(stations, stations.length ? `'${keyword}' 정류소 ${stations.length}곳` : `'${keyword}'와 일치하는 정류소가 없어요. 이름을 줄여서 검색해 보세요.`);
  } catch (error) {
    // 실패 안내 (빈 결과로 오해하지 않도록 이유를 보여줌)
    console.warn('정류소 검색 실패:', error);
    renderStationList([], `검색하지 못했어요: ${error.message}`);
  }
}

// 위치 오류 번호 → 안내 문구 (1: 권한 거부, 2: 위치 모름, 3: 시간 초과)
const LOCATION_ERROR_MESSAGES = { 1: '위치 권한이 꺼져 있어요. 브라우저 주소창의 위치 권한을 허용해 주세요.', 2: '현재 위치를 알 수 없어요. 잠시 후 다시 시도해 주세요.', 3: '위치를 찾는 데 시간이 너무 걸려요. 다시 시도해 주세요.' };

// 현재 위치를 받아 myPosition 에 기억하는 함수 (브라우저가 위치 권한을 물어봄, 10초 제한, 1분 안의 위치는 재사용)
async function locateMe() {
  // 위치 기능이 없는 브라우저
  if (!navigator.geolocation) throw new Error('이 브라우저는 위치 기능을 지원하지 않아요.');
  // 위치 받기
  const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }));
  // 위도·경도·오차(m) 기억
  myPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy || 0 };
  // 정류소 이름 아래 거리 갱신
  renderArrivalSub();
  return myPosition;
}

// 현재 위치 주변 정류소를 찾는 함수 ("내 주변 정류장" 버튼)
async function handleNearbyClick() {
  // 버튼 로딩 표시 + 결과 카드 로딩
  const nearbyButton = document.getElementById('nearbyButton');
  nearbyButton.classList.add('is-locating');
  nearbyButton.disabled = true;
  showStationLoading('현재 위치를 확인하는 중…');
  try {
    // 현재 위치 받기
    await locateMe();
    // 위치를 받았으면 주변 정류소 조회
    resultSummary.textContent = '주변 정류소를 찾는 중…';
    const stations = await searchNearbyStations(myPosition.longitude, myPosition.latitude);
    // 결과 그리기
    renderStationList(stations, stations.length ? `내 주변 정류소 ${stations.length}곳 · 가까운 순` : '주변에 정류소가 없어요. 이름으로 검색해 보세요.');
  } catch (error) {
    // 위치 오류(code 1~3)는 이유별 안내, 그 밖에는 API 오류 안내
    console.warn('주변 정류소 찾기 실패:', error);
    renderStationList([], LOCATION_ERROR_MESSAGES[error.code] || `주변 정류소를 불러오지 못했어요: ${error.message}`);
  } finally {
    // 버튼 원래대로
    nearbyButton.classList.remove('is-locating');
    nearbyButton.disabled = false;
  }
}

// 정류소 결과 카드를 열고 로딩 뼈대를 보여주는 함수
function showStationLoading(message) {
  resultCard.hidden = false;
  resultSummary.textContent = message;
  stationList.innerHTML = '<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>';
}

// 정류소 목록을 그리는 함수 (검색·주변 조회 공통, 거리가 있으면 오른쪽에 표시)
function renderStationList(stations, summary) {
  // 결과 안내
  resultSummary.textContent = summary;
  // 정류소 모음에 등록 + 지도용 목록 기억
  stations.forEach(station => knownStations.set(station.stationId, station));
  listedStations = stations;
  // 목록 그리기
  stationList.innerHTML = stations.map((station, index) => `
    <li style="--delay:${Math.min(index, 12) * 40}ms">
      <button type="button" class="station-button" data-station-id="${escapeHtml(station.stationId)}">
        <span class="station-name">${escapeHtml(station.stationName)}</span>
        <span class="station-sub">${station.mobileNo ? `${escapeHtml(station.mobileNo)} · ` : ''}${escapeHtml(station.regionName || '')}</span>
        ${station.distance !== null ? `<span class="station-distance">${formatDistance(station.distance)}</span>` : `<span class="station-arrow">${icon('chevron')}</span>`}
      </button>
    </li>`).join('');
  // 지금 보고 있는 정류소 표시 유지
  document.querySelectorAll('.station-button').forEach(button => button.classList.toggle('is-selected', button.dataset.stationId === currentStation?.stationId));
}

// 거리(m)를 "45m" / "1.2km"로 바꾸는 함수
function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

// ===== ⑤ 도착정보 =====

// 정류소를 선택했을 때 실행되는 함수 (scrollToArrivals: 사용자가 직접 눌렀을 때만 도착정보로 스크롤)
function selectStation(station, scrollToArrivals = false) {
  // 지금 보는 정류소로 기록하고 다음 접속 때도 열리도록 저장
  currentStation = station;
  saveToStorage(LAST_STATION_KEY, station);
  // 이전 정류소 자료 지우기
  lastArrivals = null;
  renderStats(null);
  // 제목·부제목 바꾸기
  document.getElementById('arrivalTitle').textContent = station.stationName;
  renderArrivalSub();
  // 즐겨찾기·새로고침 버튼 보이기
  document.getElementById('arrivalActions').hidden = false;
  // 지도에 정류소 위치 표시
  showStationOnMap(station);
  updateFavoriteButton();
  // 선택된 정류소 목록 표시
  document.querySelectorAll('.station-button').forEach(button => button.classList.toggle('is-selected', button.dataset.stationId === station.stationId));
  // 휴대폰처럼 위아래 배치일 때는 도착정보로 스크롤
  if (scrollToArrivals && window.matchMedia('(max-width: 900px)').matches) document.getElementById('arrivalColumn').scrollIntoView({ behavior: 'smooth' });
  // 도착정보 불러오기
  loadArrivals();
}

// 정류소 이름 아래 줄(정류소 번호 · 내 위치에서 거리)을 그리는 함수
function renderArrivalSub() {
  // 정류소를 고르지 않았으면 할 일 없음
  if (!currentStation) return;
  // 정류소 번호
  const numberText = currentStation.mobileNo ? `정류소 번호 ${currentStation.mobileNo}` : '정류소 번호 정보 없음';
  // 내 위치에서 거리 (모르면 빈칸)
  const distance = getMyDistanceText();
  // 화면에 반영
  document.getElementById('arrivalSub').textContent = numberText + (distance ? ` · 내 위치에서 ${distance}` : '');
  // 요약 칸의 거리도 함께 갱신
  document.getElementById('statDistance').innerHTML = distance || '<small>지도에서 내 위치 확인</small>';
}

// 내 위치와 지금 정류소 사이 직선거리 글자 ("74m"), 둘 중 하나라도 모르면 null
function getMyDistanceText() {
  // 내 위치·정류소 좌표·지도 프로그램(거리 계산용)이 모두 있어야 계산 가능
  if (!myPosition || !currentStation?.x || typeof L === 'undefined') return null;
  return formatDistance(L.latLng(myPosition.latitude, myPosition.longitude).distanceTo([currentStation.y, currentStation.x]));
}

// 요약 숫자 3칸(노선 수·5분 안 도착·가장 먼저 오는 버스)을 그리는 함수 (arrivalData 가 없으면 "—")
function renderStats(arrivalData) {
  // 요소들
  const routesElement = document.getElementById('statRoutes');
  const soonElement = document.getElementById('statSoon');
  const firstElement = document.getElementById('statFirst');
  // 자료가 없으면 비움
  if (!arrivalData) { routesElement.textContent = soonElement.textContent = firstElement.textContent = '—'; return; }
  // 도착 정보가 있는 노선만
  const { arrivals, fetchedAt } = arrivalData;
  const runningRoutes = arrivals.filter(route => route.buses.length > 0);
  // 노선 수: "도착 예정 / 전체"
  routesElement.innerHTML = `${runningRoutes.length}<small> / ${arrivals.length}개</small>`;
  // 5분(300초) 안에 오는 버스 수 (노선마다 두 대까지)
  soonElement.innerHTML = `${arrivals.flatMap(route => route.buses).filter(bus => bus.seconds <= 300).length}<small>대</small>`;
  // 가장 먼저 오는 버스 (목록이 이미 빠른 순으로 정렬돼 있음) — 남은 시간은 1초마다 줄어듦
  const first = runningRoutes[0];
  firstElement.innerHTML = first ? `<span class="stat-route route-${first.color}">${escapeHtml(first.routeName)}</span><b data-arrive-at="${fetchedAt + first.buses[0].seconds * 1000}"></b>` : '<small>도착 예정 없음</small>';
  // 남은 시간 글자 바로 채우기
  updateCountdowns();
}

// 지금 정류소의 도착정보를 불러와 그리는 함수
async function loadArrivals() {
  // 정류소를 고르지 않았으면 할 일 없음
  if (!currentStation) return;
  // 예약된 자동 새로고침 취소 (중복 방지)
  clearTimeout(refreshTimer);
  // 이번 요청 번호
  const requestNumber = ++latestArrivalRequest;
  // 요청한 정류소 (기다리는 사이 바뀌었는지 확인용)
  const stationId = currentStation.stationId;
  // 처음 불러오는 거면 뼈대, 갱신이면 기존 목록 유지 + "갱신 중" 표시
  if (!lastArrivals) busList.innerHTML = '<li class="skeleton bus-skeleton"></li><li class="skeleton bus-skeleton"></li><li class="skeleton bus-skeleton"></li>';
  renderMeta('loading');
  // 새로고침 아이콘 회전
  refreshButton.classList.add('is-spinning');
  try {
    // 도착정보 요청
    const arrivals = await fetchArrivals(stationId);
    // 그 사이 다른 정류소를 골랐으면 무시
    if (requestNumber !== latestArrivalRequest) return;
    // 처음 그리는 것인지 기억 (처음만 등장 애니메이션)
    const isFirstRender = !lastArrivals;
    // 성공 자료 저장 (받은 시각 포함 → 카운트다운 기준)
    lastArrivals = { arrivals, fetchedAt: Date.now() };
    // 목록·상태 그리기
    renderArrivals(lastArrivals, isFirstRender);
    renderStats(lastArrivals);
    renderMeta('ok');
  } catch (error) {
    // 옛 응답이면 무시
    if (requestNumber !== latestArrivalRequest) return;
    // 오류 기록
    console.warn('도착정보 불러오기 실패:', error);
    // 이전 자료가 있으면 계속 보여주고 "갱신 실패" 표시, 없으면 사용 불가 안내
    if (lastArrivals) renderMeta('failed-with-previous');
    else {
      renderMeta('failed');
      busList.innerHTML = `<li class="empty-state"><div class="empty-illustration is-error">${icon('offline')}</div><p>도착정보를 받을 수 없어요</p><p class="muted small">${escapeHtml(error.message)}</p><button type="button" class="pill-button" id="retryButton">다시 시도</button></li>`;
      document.getElementById('retryButton').addEventListener('click', loadArrivals);
    }
  } finally {
    // 최신 요청일 때만 마무리 (아이콘 멈춤 + 다음 자동 새로고침 예약)
    if (requestNumber === latestArrivalRequest) {
      refreshButton.classList.remove('is-spinning');
      scheduleNextRefresh();
    }
  }
}

// 도착정보 목록을 그리는 함수
function renderArrivals({ arrivals, fetchedAt }, animate) {
  // 이 정류소를 지나는 노선이 없으면 안내 (0건과 오류를 구분)
  if (arrivals.length === 0) {
    busList.innerHTML = '<li class="empty-state"><div class="empty-illustration">' + icon('moon') + '</div><p>이 정류소에 도착 예정인 버스가 없어요</p><p class="muted small">운행 시간이 아니거나 지나는 노선이 없어요.</p></li>';
    return;
  }
  // 노선마다 카드 하나
  busList.innerHTML = arrivals.map((route, index) => {
    // 첫 번째·두 번째 버스
    const [first, second] = route.buses;
    // 카드 HTML (처음 그릴 때만 순서대로 떠오르는 애니메이션)
    return `
      <li class="bus-card route-${route.color} ${animate ? 'is-entering' : ''}" style="--delay:${Math.min(index, 10) * 60}ms">
        <div class="route-info">
          <span class="route-badge"><small>${escapeHtml(route.typeName)}</small>${escapeHtml(route.routeName)}</span>
          <span class="route-dest">${route.destination ? `${escapeHtml(route.destination)} 방면` : ''}</span>
        </div>
        ${first ? renderFirstBus(first, fetchedAt) : `<p class="eta-none">${escapeHtml(FLAG_NAMES[route.flag] || '도착 정보 없음')}</p>`}
        ${second ? `<p class="next-bus">다음 버스 <b data-arrive-at="${fetchedAt + second.seconds * 1000}"></b> · ${second.stopsAway}정류장 전${second.seats !== null ? ` · 좌석 ${second.seats}` : ''}</p>` : ''}
      </li>`;
  }).join('');
  // 카운트다운 글자 바로 채우기
  updateCountdowns();
}

// 첫 번째로 오는 버스의 큰 표시를 만드는 함수
function renderFirstBus(bus, fetchedAt) {
  // 버스가 정류소에 얼마나 가까운지 (10정류장 전 = 0, 도착 = 1) → 작은 길 위 버스 위치
  const progress = Math.max(0.04, 1 - Math.min(bus.stopsAway, 10) / 10);
  // 작은 배지들 (저상·2층·좌석·혼잡도)
  const badges = [
    bus.lowFloor ? `<span class="tag tag-low">${icon('wheelchair')}저상</span>` : '',
    bus.doubleDecker ? '<span class="tag">2층</span>' : '',
    bus.seats !== null ? `<span class="tag ${bus.seats <= 5 ? 'tag-warn' : ''}">좌석 ${bus.seats}</span>` : '',
    bus.crowded ? `<span class="tag crowd-${escapeHtml(bus.crowded)}">${escapeHtml(bus.crowded)}</span>` : ''
  ].join('');
  // 표시 HTML
  return `
    <div class="eta">
      <b class="eta-time" data-arrive-at="${fetchedAt + bus.seconds * 1000}"></b>
      <span class="eta-detail">${bus.stopsAway}정류장 전${bus.currentStation ? ` · ${escapeHtml(bus.currentStation)}` : ''}</span>
    </div>
    <div class="bus-track" style="--progress:${progress}" aria-hidden="true"><span class="track-line"></span><span class="track-bus">${icon('bus')}</span><span class="track-stop">${icon('stop')}</span></div>
    ${badges ? `<div class="tags">${badges}</div>` : ''}`;
}

// 출처·확인 시각·갱신 상태 표시줄을 그리는 함수
function renderMeta(state) {
  // 상태별 칩
  const statusChip = {
    loading: '<span class="chip is-loading"><i class="pulse-dot"></i>갱신 중…</span>',
    ok: '<span class="chip is-ok"><i class="pulse-dot"></i>실시간</span>',
    failed: `<span class="chip is-error">${icon('alert')}자료를 받을 수 없음</span>`,
    'failed-with-previous': `<span class="chip is-error">${icon('alert')}갱신 실패 · 이전 자료예요</span>`
  }[state];
  // 마지막으로 성공한 시각
  const checked = lastArrivals ? new Date(lastArrivals.fetchedAt).toLocaleTimeString('ko-KR') : '확인 불가';
  // 표시줄 그리기
  arrivalMeta.innerHTML = `${statusChip}<span class="chip">출처 · 경기도 버스정보</span><span class="chip">마지막 확인 · ${checked}</span><span class="chip">${REFRESH_SECONDS}초마다 자동 새로고침</span>`;
}

// ===== ⑥ 자동 새로고침·카운트다운 =====

// 다음 자동 새로고침을 예약하는 함수 (새로고침 버튼 둘레 원이 줄어드는 애니메이션도 다시 시작)
function scheduleNextRefresh() {
  // 이전 예약 취소
  clearTimeout(refreshTimer);
  // 탭이 안 보이면 예약하지 않음 (보이면 다시 시작 — 호출 수 절약)
  if (document.hidden || !currentStation) return;
  // 원 애니메이션 다시 시작 (클래스를 뗐다 붙임)
  refreshButton.classList.remove('is-counting');
  void refreshButton.offsetWidth;
  refreshButton.style.setProperty('--refresh-seconds', `${REFRESH_SECONDS}s`);
  refreshButton.classList.add('is-counting');
  // 예약
  refreshTimer = setTimeout(loadArrivals, REFRESH_SECONDS * 1000);
}

// 남은 초를 "3분 05초" / "곧 도착" 글자로 바꾸는 함수
function formatRemaining(seconds) {
  // 1분 이내면 "곧 도착"
  if (seconds <= 60) return '곧 도착';
  // 분·초 계산
  const minutes = Math.floor(seconds / 60);
  // 10분 이상이면 분만, 아니면 초까지
  return minutes >= 10 ? `${minutes}분` : `${minutes}분 ${String(Math.floor(seconds % 60)).padStart(2, '0')}초`;
}

// 화면의 모든 도착 시간 글자를 지금 시각 기준으로 다시 쓰는 함수 (1초마다 실행)
function updateCountdowns() {
  // 지금 시각
  const now = Date.now();
  // 도착 시각이 적힌 모든 요소
  document.querySelectorAll('[data-arrive-at]').forEach(element => {
    // 남은 초
    const seconds = (Number(element.dataset.arriveAt) - now) / 1000;
    // 글자 바꾸기
    element.textContent = formatRemaining(seconds);
    // 곧 도착이면 강조 (깜빡임)
    element.classList.toggle('is-soon', seconds <= 60);
  });
}

// 상단 시계를 갱신하는 함수
function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===== ⑥-2 지도 =====

// 선택한 정류소를 지도 가운데에 표시하는 함수 (결과 목록의 다른 정류소·내 위치도 함께)
function showStationOnMap(station, moveToStation = true) {
  // 지도 상자
  const mapBox = document.getElementById('stationMap');
  // 지도 프로그램(Leaflet)을 못 불러왔거나(인터넷 끊김 등) 좌표가 없는 정류소면 지도 숨김
  // (좌표 저장 전에 만든 즐겨찾기는 좌표가 없음 → 다시 검색해서 즐겨찾기하면 표시됨)
  if (typeof L === 'undefined' || !station.x || !station.y) { mapBox.hidden = true; return; }
  // 지도 보이기
  mapBox.hidden = false;
  // 처음 만드는 지도인지 (처음엔 날아갈 출발점이 없어서 바로 위치를 정해야 함)
  const isNewMap = !stationMap;
  // 처음 한 번만 지도 만들기 (마우스 휠 확대는 페이지 스크롤과 겹쳐서 끔)
  if (isNewMap) {
    stationMap = L.map(mapBox, { scrollWheelZoom: false, zoomControl: true });
    // OpenStreetMap 지도 그림 (출처 표기는 이용 조건)
    // shortcut: OSM 공용 서버는 많은 사용량을 허용하지 않음, 실제 서비스로 키우면 카카오맵 등 키 발급 지도나 유료 타일로 바꿀 것
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(stationMap);
    // 표시들을 한꺼번에 지우고 다시 그리기 위한 묶음
    mapMarkers = L.layerGroup().addTo(stationMap);
    // 지도 오른쪽 위 "내 위치 보기" 버튼
    addLocateButton();
    // 첫 위치를 바로 정함 (위치가 없는 지도는 그려지지 않음)
    stationMap.setView([station.y, station.x], 17);
  }
  // 숨겨져 있다가 보이면 크기를 다시 계산해야 지도가 깨지지 않음
  stationMap.invalidateSize();
  // 이전 표시 지우기
  mapMarkers.clearLayers();
  // 결과 목록의 다른 정류소: 작은 점 (누르면 그 정류소로 이동)
  listedStations.filter(other => other.x && other.y && other.stationId !== station.stationId).forEach(other => {
    L.marker([other.y, other.x], { icon: L.divIcon({ className: 'map-dot', iconSize: [16, 16] }), title: other.stationName })
      .bindTooltip(escapeHtml(other.stationName), { direction: 'top', offset: [0, -8] })
      .on('click', () => selectStation(other))
      .addTo(mapMarkers);
  });
  // 내 위치 (알고 있으면)
  drawMyPosition();
  // 선택한 정류소: 큰 핀 + 퍼지는 원 (이름 말풍선은 늘 보이게)
  L.marker([station.y, station.x], { icon: L.divIcon({ className: 'map-pin', html: `<span>${icon('bus')}</span>`, iconSize: [44, 44], iconAnchor: [22, 40] }), zIndexOffset: 1000, title: station.stationName })
    .bindTooltip(escapeHtml(station.stationName), { permanent: true, direction: 'top', offset: [0, -40], className: 'map-label' })
    .addTo(mapMarkers);
  // 두 번째 정류소부터는 부드럽게 날아가듯 이동 (움직임 줄이기 설정이면 바로)
  if (isNewMap || !moveToStation) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stationMap.setView([station.y, station.x], 17);
  else stationMap.flyTo([station.y, station.x], 17, { duration: 0.9 });
}

// 내 위치를 지도에 그리는 함수 (오차 범위 원 + 파란 점)
function drawMyPosition() {
  // 위치를 모르거나 지도가 없으면 생략
  if (!myPosition || !mapMarkers) return;
  // 위치
  const latLng = [myPosition.latitude, myPosition.longitude];
  // 오차 범위 (옅은 파란 원, 오차가 클수록 큼)
  if (myPosition.accuracy) L.circle(latLng, { radius: myPosition.accuracy, color: '#2563eb', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.12, interactive: false }).addTo(mapMarkers);
  // 파란 점
  L.marker(latLng, { icon: L.divIcon({ className: 'map-me', iconSize: [18, 18] }), title: '내 위치', interactive: false, zIndexOffset: 500 }).addTo(mapMarkers);
}

// 지도 오른쪽 위에 "내 위치 보기" 버튼을 붙이는 함수
function addLocateButton() {
  // Leaflet 지도 조작 버튼 틀을 이용해 버튼 하나 만들기
  const LocateControl = L.Control.extend({
    onAdd() {
      // 버튼 요소 (확대 버튼과 같은 유리 막대 모양)
      const button = L.DomUtil.create('button', 'leaflet-bar locate-button');
      button.type = 'button';
      button.id = 'locateButton';
      button.innerHTML = icon('locate');
      button.title = '내 위치 보기';
      button.setAttribute('aria-label', '내 위치 보기');
      // 버튼을 눌러도 지도가 같이 움직이거나 확대되지 않게
      L.DomEvent.disableClickPropagation(button);
      // 누르면 내 위치 보기
      L.DomEvent.on(button, 'click', showMyLocation);
      return button;
    }
  });
  // 오른쪽 위에 붙이기
  new LocateControl({ position: 'topright' }).addTo(stationMap);
}

// "내 위치 보기" 버튼 동작: 위치를 받아 지도에 그리고, 내 위치와 정류소가 한 화면에 들어오게 맞춤
async function showMyLocation() {
  // 버튼 (위치를 찾는 동안 깜빡임)
  const button = document.getElementById('locateButton');
  button.classList.add('is-locating');
  button.disabled = true;
  try {
    // 위치 받기
    await locateMe();
    // 지도 다시 그리기 (내 위치 포함) — 정류소로 날아가지 않도록 표시만 다시 그림
    showStationOnMap(currentStation, false);
    // 내 위치와 정류소를 함께 보이게 (너무 가까우면 17배율까지만)
    const bounds = L.latLngBounds([[myPosition.latitude, myPosition.longitude], [currentStation.y, currentStation.x]]);
    stationMap.flyToBounds(bounds.pad(0.4), { maxZoom: 17, duration: 0.9 });
    // 버튼 켜짐 표시
    button.classList.add('is-active');
  } catch (error) {
    // 실패 이유 알림
    console.warn('내 위치 찾기 실패:', error);
    showToast(LOCATION_ERROR_MESSAGES[error.code] || error.message);
  } finally {
    // 버튼 원래대로
    button.classList.remove('is-locating');
    button.disabled = false;
  }
}

// ===== ⑦ 즐겨찾기 =====

// 저장된 즐겨찾기 목록 불러오기
function loadFavorites() {
  return loadFromStorage(FAVORITES_KEY) || [];
}

// 지금 정류소가 즐겨찾기에 있는지
function isFavorite(stationId) {
  return loadFavorites().some(station => station.stationId === stationId);
}

// 즐겨찾기 추가/해제 버튼 동작
function toggleFavorite() {
  // 정류소가 없으면 무시
  if (!currentStation) return;
  // 이미 있으면 빼고, 없으면 앞에 추가
  const favorites = loadFavorites();
  const exists = isFavorite(currentStation.stationId);
  saveToStorage(FAVORITES_KEY, exists ? favorites.filter(station => station.stationId !== currentStation.stationId) : [currentStation, ...favorites]);
  // 화면 갱신 + 알림
  updateFavoriteButton();
  renderFavorites();
  showToast(exists ? '즐겨찾기에서 뺐어요.' : '즐겨찾기에 추가했어요.');
  // 별이 톡 튀는 애니메이션
  favoriteButton.classList.remove('is-popping');
  void favoriteButton.offsetWidth;
  favoriteButton.classList.add('is-popping');
}

// 즐겨찾기 버튼 모양(빈 별/채운 별)을 지금 상태에 맞추는 함수
function updateFavoriteButton() {
  // 즐겨찾기 여부
  const favorite = currentStation && isFavorite(currentStation.stationId);
  // 모양·이름·상태 갱신
  favoriteButton.classList.toggle('is-active', Boolean(favorite));
  favoriteButton.setAttribute('aria-pressed', String(Boolean(favorite)));
  favoriteButton.setAttribute('aria-label', favorite ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가');
}

// 즐겨찾기 정류소 버튼들을 그리는 함수
function renderFavorites() {
  // 목록 (정류소 모음에도 등록)
  const favorites = loadFavorites();
  favorites.forEach(station => knownStations.set(station.stationId, station));
  // 없으면 안내, 있으면 버튼들
  document.getElementById('favoriteList').innerHTML = favorites.length === 0
    ? '<p class="muted small">정류소에서 별을 누르면 여기에 모여요.</p>'
    : favorites.map(station => `<button type="button" class="favorite-chip" data-station-id="${escapeHtml(station.stationId)}">${escapeHtml(station.stationName)}${station.mobileNo ? ` <small>${escapeHtml(station.mobileNo)}</small>` : ''}</button>`).join('');
}

// ===== ⑧ 공통 도우미 =====

// 직접 그린 아이콘을 불러오는 HTML (index.html 맨 위 아이콘 묶음의 이름, 장식용이라 스크린리더는 건너뜀)
function icon(name, extraClass = '') {
  return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

// 외부 자료를 화면에 넣기 전에 HTML 특수문자를 안전한 글자로 바꾸는 함수 (보안)
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

// 브라우저 저장소에서 읽기 (못 쓰는 환경이거나 값이 깨졌으면 null)
function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

// 브라우저 저장소에 쓰기 (실패해도 화면은 계속 동작)
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 실패는 무시 */ }
}

// 화면 아래에 알림을 잠깐 띄우는 함수
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

// 유리 카드 위에서 마우스를 따라 빛 반사가 움직이는 효과 (마우스가 있는 기기만)
function setupGlassShine() {
  // 터치 기기나 움직임 줄이기 설정이면 생략
  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 마우스가 움직이면 아래에 있는 유리 카드의 빛 위치 갱신
  document.addEventListener('pointermove', event => {
    const glass = event.target.closest('.glass');
    if (!glass) return;
    const rect = glass.getBoundingClientRect();
    glass.style.setProperty('--shine-x', `${event.clientX - rect.left}px`);
    glass.style.setProperty('--shine-y', `${event.clientY - rect.top}px`);
  }, { passive: true });
}

// ===== ⑨ 시작 =====

// 화면 기능을 한꺼번에 연결하는 시작 함수
function startBusApp() {
  // 검색 폼
  document.getElementById('stationSearchForm').addEventListener('submit', handleSearchSubmit);
  // 정류소 목록·즐겨찾기 버튼을 누르면 그 정류소 선택 (화면 전체에 한 번만 연결)
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-station-id]');
    if (button && knownStations.has(button.dataset.stationId)) selectStation(knownStations.get(button.dataset.stationId), true);
  });
  // 내 주변 정류장 버튼
  document.getElementById('nearbyButton').addEventListener('click', handleNearbyClick);
  // 새로고침·즐겨찾기 버튼
  refreshButton.addEventListener('click', loadArrivals);
  favoriteButton.addEventListener('click', toggleFavorite);
  // 탭이 다시 보이면 바로 새로고침, 숨으면 자동 새로고침 멈춤
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(refreshTimer); else loadArrivals(); });
  // 1초마다 시계·카운트다운 갱신
  setInterval(() => { updateClock(); updateCountdowns(); }, 1000);
  updateClock();
  // 즐겨찾기 그리기 + 유리 빛 효과
  renderFavorites();
  setupGlassShine();
  // 마지막으로 보던 정류소가 있으면 바로 열기
  const lastStation = loadFromStorage(LAST_STATION_KEY);
  if (lastStation?.stationId) selectStation(lastStation);
  // 아니면 검색칸에 커서
  else document.getElementById('stationSearchInput').focus();
}

// HTML이 모두 준비되면 시작
document.addEventListener('DOMContentLoaded', startBusApp);
