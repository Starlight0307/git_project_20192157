// =============================================================
// movie.js : 실제 영화 데이터(KOFIC·TMDB)를 불러와 화면을 움직이는 스크립트
// 순서: ① 기본 설정 → ② 데이터 불러오기(API) → ③ 공통 도우미 → ④ 순위
//       → ⑤ 현재 상영작 → ⑥ 영화 상세 팝업 → ⑦ 검색 → ⑧ 메뉴·탭
//       → ⑨ 모션 효과 → ⑩ 시작
// 데이터 출처: 박스오피스·영화 기본정보 = 영화진흥위원회(KOFIC)
//            현재 상영작·포스터·줄거리 = TMDB
// =============================================================

// ===== ① 기본 설정 =====

// 영화진흥위원회 오픈 API 주소
const KOFIC_BASE_URL = 'https://www.kobis.or.kr/kobisopenapi/webservice/rest';
// TMDB API 주소
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// TMDB 포스터 이미지 주소 (w500 = 가로 500px 크기)
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// 사용자가 "움직임 줄이기"를 켜 두었는지 확인 (켜져 있으면 큰 모션을 생략)
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 한 번 받은 응답을 저장해 두는 곳 (같은 자료를 여러 번 요청하지 않기 위함)
const requestCache = {};

// 마지막으로 성공한 순위 자료 (갱신 실패 시 "이전 자료 + 실패 상태"를 함께 보여주기 위함)
const lastSuccessfulRanking = {};

// "현재 상영 중"으로 확인된 영화 제목 모음 (일별 박스오피스·현재 상영작에서 채움)
const showingTitles = new Set();

// 가장 최근 순위 요청 번호 (탭을 빠르게 바꿀 때 늦게 도착한 옛날 응답을 무시하기 위함)
let latestRankingRequest = 0;

// 화면에서 자주 쓰는 요소들을 미리 찾아 둠
const rankingList = document.getElementById('rankingList');
const rankingMeta = document.getElementById('rankingMeta');
const nowPlayingGrid = document.getElementById('nowPlayingGrid');
const nowPlayingMeta = document.getElementById('nowPlayingMeta');
const movieDialog = document.getElementById('movieDialog');
const dialogBody = document.getElementById('dialogBody');
const searchStatusText = document.getElementById('searchStatusText');
const searchResultGrid = document.getElementById('searchResultGrid');

// ===== ② 데이터 불러오기 (API) =====

// API 키가 비어 있을 때 쓰는 오류 (화면에 그대로 안내 문구로 보여줌)
function createMissingKeyError(serviceName) {
  // 안내 문구를 담은 오류 만들기
  const error = new Error(`${serviceName} API 키가 없어요. js/config.example.js를 복사해 js/config.js를 만들고 발급받은 키를 넣어주세요.`);
  // 다른 오류와 구분하기 위한 이름
  error.name = 'MissingKeyError';
  // 오류 반환
  return error;
}

// 주소로 JSON 자료를 받아오는 공통 함수 (8초 안에 응답이 없으면 실패 처리)
async function fetchJson(url) {
  // 요청 보내기 (8초 제한)
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  // 서버가 오류 상태(404, 401 등)를 돌려주면 실패
  if (!response.ok) throw new Error(`응답 오류 ${response.status}`);
  // JSON으로 변환
  const data = await response.json();
  // KOFIC은 키가 틀려도 200을 주고 faultInfo에 오류를 담아 보냄 → 실패로 처리
  if (data.faultInfo) throw new Error(data.faultInfo.message);
  // 정상 자료 반환
  return data;
}

// 같은 요청은 한 번만 보내고 결과를 재사용하는 함수 (실패하면 저장하지 않아 다시 시도 가능)
function fetchOnce(cacheKey, makeRequest) {
  // 아직 요청한 적이 없으면 요청을 만들어 저장
  if (!requestCache[cacheKey]) {
    // 실패했을 때는 저장된 것을 지워서 "다시 시도"가 실제로 다시 요청하게 함
    requestCache[cacheKey] = makeRequest().catch(error => { delete requestCache[cacheKey]; throw error; });
  }
  // 저장된 요청(Promise) 반환
  return requestCache[cacheKey];
}

// KOFIC API 호출 함수 (path: 기능 주소, params: 추가 조건)
function fetchKofic(path, params) {
  // 키가 없으면 바로 안내 오류
  // config.js 파일이 없거나 키가 비어 있으면 안내 오류 (typeof: 파일이 없어 변수 자체가 없을 때도 멈추지 않게)
  if (typeof KOFIC_API_KEY === 'undefined' || !KOFIC_API_KEY) return Promise.reject(createMissingKeyError('영화진흥위원회(KOFIC)'));
  // 키와 조건을 붙인 주소 만들기
  const query = new URLSearchParams({ key: KOFIC_API_KEY, ...params });
  // 자료 요청
  return fetchJson(`${KOFIC_BASE_URL}${path}?${query}`);
}

// TMDB API 호출 함수 (한국어·한국 지역 기준으로 요청)
function fetchTmdb(path, params = {}) {
  // 키가 없으면 바로 안내 오류
  // config.js 파일이 없거나 키가 비어 있으면 안내 오류
  if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) return Promise.reject(createMissingKeyError('TMDB'));
  // 키·언어·조건을 붙인 주소 만들기
  const query = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'ko-KR', ...params });
  // 자료 요청
  return fetchJson(`${TMDB_BASE_URL}${path}?${query}`);
}

// 박스오피스 순위 불러오기 (period: 'daily' 어제 기준 | 'weekly' 지난주 기준)
function fetchBoxOffice(period) {
  // 같은 기간은 한 번만 요청
  return fetchOnce(`boxoffice:${period}`, async () => {
    // 일별은 어제, 주간은 일주일 전 날짜로 요청 (당일 자료는 아직 집계되지 않음)
    const targetDate = toKoficDate(period === 'daily' ? 1 : 7);
    // 일별/주간에 맞는 KOFIC 기능 주소
    const path = period === 'daily' ? '/boxoffice/searchDailyBoxOfficeList.json' : '/boxoffice/searchWeeklyBoxOfficeList.json';
    // 주간은 weekGb=0 (월~일 전체 주간) 조건 추가
    const data = await fetchKofic(path, period === 'daily' ? { targetDt: targetDate } : { targetDt: targetDate, weekGb: '0' });
    // 순위 목록 꺼내기 (일별/주간에 따라 이름이 다름)
    const list = data.boxOfficeResult.dailyBoxOfficeList || data.boxOfficeResult.weeklyBoxOfficeList || [];
    // 화면에서 쓰기 쉬운 모양으로 정리해서 반환
    return {
      label: period === 'daily' ? '일별 박스오피스' : '주간 박스오피스',
      source: '영화진흥위원회 통합전산망',
      basis: period === 'daily' ? '하루 관객수 기준' : '주간(월~일) 관객수 기준',
      baseDate: formatShowRange(data.boxOfficeResult.showRange),
      checkedAt: new Date(),
      staleAfterMinutes: 60 * 6,
      items: list.map(item => ({
        rank: Number(item.rank),
        movieCd: item.movieCd,
        title: item.movieNm,
        openDate: item.openDt,
        audience: Number(item.audiCnt),
        change: item.rankOldAndNew === 'NEW' ? 'NEW' : Number(item.rankInten)
      }))
    };
  });
}

// 국내 현재 상영작 불러오기 (TMDB)
function fetchNowPlaying() {
  // 한 번만 요청
  return fetchOnce('nowplaying', async () => {
    // 한국 지역의 현재 상영작 요청
    // shortcut: 첫 페이지(최대 20편)만 사용, 더 필요하면 page=2.. 를 이어서 요청
    const data = await fetchTmdb('/movie/now_playing', { region: 'KR' });
    // 정리해서 반환 (인기 지표 높은 순으로 정렬)
    return {
      label: '현재 상영작',
      source: 'TMDB 현재 상영작 (한국)',
      basis: 'TMDB 인기 지표 순',
      checkedAt: new Date(),
      staleAfterMinutes: 60 * 6,
      movies: data.results.sort((a, b) => b.popularity - a.popularity).map(convertTmdbMovie)
    };
  });
}

// TMDB 영화 자료를 화면용 모양으로 바꾸는 함수
function convertTmdbMovie(tmdbMovie) {
  // 화면에서 공통으로 쓰는 영화 모양
  return {
    key: `tmdb:${tmdbMovie.id}`,
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path ? TMDB_IMAGE_URL + tmdbMovie.poster_path : null,
    overview: tmdbMovie.overview || null,
    openDate: tmdbMovie.release_date || null
  };
}

// 영화 제목(+개봉 연도)으로 TMDB에서 포스터·줄거리를 찾는 함수 (못 찾으면 null)
function findTmdbMatch(title, openDate) {
  // 같은 제목은 한 번만 검색
  return fetchOnce(`match:${title}:${openDate}`, async () => {
    // 개봉 연도가 있으면 같이 넘겨서 동명 영화를 걸러냄
    const params = openDate ? { query: title, year: openDate.slice(0, 4) } : { query: title };
    // 제목으로 검색
    const data = await fetchTmdb('/search/movie', params);
    // 첫 번째 결과를 사용 (없으면 null)
    // shortcut: 검색 1순위를 같은 영화로 간주, 틀린 포스터가 자주 보이면 원제·감독까지 비교할 것
    return data.results[0] ? convertTmdbMovie(data.results[0]) : null;
  });
}

// KOFIC 영화 코드로 영화 상세 정보 불러오기 (+ TMDB 포스터·줄거리)
async function fetchKoficMovieDetail(movieCd) {
  // KOFIC 영화 상세 요청
  const data = await fetchKofic('/movie/searchMovieInfo.json', { movieCd });
  // 상세 정보 꺼내기
  const info = data.movieInfoResult.movieInfo;
  // 개봉일 "20261029" → "2026-10-29"
  const openDate = info.openDt ? `${info.openDt.slice(0, 4)}-${info.openDt.slice(4, 6)}-${info.openDt.slice(6, 8)}` : null;
  // TMDB 포스터·줄거리 찾기 (TMDB가 실패해도 KOFIC 정보는 보여주도록 오류를 무시)
  const tmdbMatch = await findTmdbMatch(info.movieNm, openDate).catch(() => null);
  // 화면용 모양으로 정리
  return {
    key: `kofic:${movieCd}`,
    title: info.movieNm,
    posterUrl: tmdbMatch?.posterUrl || null,
    overview: tmdbMatch?.overview || null,
    genres: info.genres.map(genre => genre.genreNm).join(', ') || null,
    runtime: Number(info.showTm) || null,
    openDate,
    grade: info.audits[0]?.watchGradeNm || null,
    directors: info.directors.map(person => person.peopleNm).join(', ') || null,
    actors: info.actors.slice(0, 5).map(person => person.peopleNm).join(', ') || null,
    tmdbId: tmdbMatch?.tmdbId || null,
    source: tmdbMatch ? '영화진흥위원회 · 포스터/줄거리 TMDB' : '영화진흥위원회'
  };
}

// TMDB 영화 번호로 상세 정보 불러오기
async function fetchTmdbMovieDetail(tmdbId) {
  // 상세 + 출연진(credits) + 국가별 관람등급(release_dates) 한 번에 요청
  const data = await fetchTmdb(`/movie/${tmdbId}`, { append_to_response: 'credits,release_dates' });
  // 한국 관람등급 찾기
  const koreaRelease = data.release_dates.results.find(release => release.iso_3166_1 === 'KR');
  // 화면용 모양으로 정리
  return {
    ...convertTmdbMovie(data),
    genres: data.genres.map(genre => genre.name).join(', ') || null,
    runtime: data.runtime || null,
    grade: koreaRelease?.release_dates.find(item => item.certification)?.certification || null,
    directors: data.credits.crew.filter(person => person.job === 'Director').map(person => person.name).join(', ') || null,
    actors: data.credits.cast.slice(0, 5).map(person => person.name).join(', ') || null,
    source: 'TMDB'
  };
}

// KOFIC 영화 상세를 한 번만 요청하고 재사용 (카드 등급 표시와 상세 팝업이 같이 사용)
function getKoficDetail(movieCd) {
  return fetchOnce(`kofic-detail:${movieCd}`, () => fetchKoficMovieDetail(movieCd));
}

// TMDB 영화 상세를 한 번만 요청하고 재사용
function getTmdbDetail(tmdbId) {
  return fetchOnce(`tmdb-detail:${tmdbId}`, () => fetchTmdbMovieDetail(tmdbId));
}

// TMDB 영화 번호로 유튜브 예고편·광고 영상 목록 불러오기 (한국어 영상 먼저, 없으면 영어 영상)
function fetchTrailers(tmdbId) {
  // 같은 영화는 한 번만 요청
  return fetchOnce(`videos:${tmdbId}`, async () => {
    // 한국어·영어 영상을 함께 요청
    const data = await fetchTmdb(`/movie/${tmdbId}/videos`, { include_video_language: 'ko,en' });
    // 영상 종류별 우선순위 (예고편 → 티저 → 클립 → 메이킹)
    const typeOrder = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
    // 유튜브 영상 중 위 종류만 남기고, 한국어 → 종류 순서로 정렬해 최대 6개
    return data.results
      .filter(video => video.site === 'YouTube' && typeOrder.includes(video.type))
      .sort((a, b) => (a.iso_639_1 === 'ko' ? 0 : 1) - (b.iso_639_1 === 'ko' ? 0 : 1) || typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
      .slice(0, 6);
  });
}

// ===== ③ 공통 도우미 함수 =====

// 관람등급 글자("15세이상관람가", "All", "18" 등)를 색깔 아이콘 HTML로 바꾸는 함수
function createGradeBadge(grade) {
  // 등급 정보가 없으면 아이콘을 그리지 않음
  if (!grade) return '';
  // 등급 글자에 들어 있는 단어·숫자로 종류 판단 [아이콘 글자, 색 이름, 읽어줄 이름]
  const [label, colorName, fullName] =
    /전체|^all$/i.test(grade) ? ['ALL', 'all', '전체 관람가']
    : /12/.test(grade) ? ['12', '12', '12세 이상 관람가']
    : /15/.test(grade) ? ['15', '15', '15세 이상 관람가']
    : /청소년|제한|18|19/.test(grade) ? ['19', '19', '청소년 관람불가']
    : [null];
  // 알 수 없는 등급이면 아이콘 생략
  if (!label) return '';
  // 아이콘 HTML (스크린리더는 전체 이름을 읽음)
  return `<span class="grade-badge grade-${colorName}" role="img" aria-label="${fullName}" title="${fullName}">${label}</span>`;
}

// 영화 버튼의 포스터 왼쪽 위에 관람등급 아이콘을 붙이는 함수 (등급을 못 받으면 조용히 생략)
function attachGradeBadge(movieButton) {
  // 버튼에 적힌 번호로 KOFIC 또는 TMDB 상세 요청
  const detailRequest = movieButton.dataset.tmdbId ? getTmdbDetail(movieButton.dataset.tmdbId) : getKoficDetail(movieButton.dataset.koficCode);
  // 받아오면 포스터에 아이콘 추가
  detailRequest.then(movie => movieButton.querySelector('.poster').insertAdjacentHTML('beforeend', createGradeBadge(movie.grade))).catch(() => {});
}

// 며칠 전 날짜를 KOFIC 형식 "YYYYMMDD"로 만드는 함수
function toKoficDate(daysAgo) {
  // 오늘 날짜에서 daysAgo 일을 뺌
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // 연·월·일을 이어 붙임 (월·일은 두 자리)
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

// KOFIC 기간 "20261102~20261108"을 "11월 2일 (월) ~ 11월 8일 (일)"로 바꾸는 함수
function formatShowRange(showRange) {
  // 기간이 없으면 null (화면에 "확인 불가"로 표시됨)
  if (!showRange) return null;
  // "YYYYMMDD" → "YYYY-MM-DD" → 한국어 날짜
  const [start, end] = showRange.split('~').map(text => formatKoreanDate(`${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`));
  // 하루짜리면 한 번만, 아니면 "시작 ~ 끝"
  return start === end ? start : `${start} ~ ${end}`;
}

// 제목 비교용으로 공백·기호를 없애고 소문자로 바꾸는 함수 ("서울, 마지막 열차" = "서울마지막열차")
function normalizeTitle(title) {
  // 글자·숫자만 남기고 소문자로
  return title.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
}

// 글자 안의 HTML 특수문자를 안전한 글자로 바꾸는 함수 (외부 API 자료를 화면에 넣을 때 보안용)
function escapeHtml(text) {
  // & < > " ' 다섯 글자를 HTML 엔티티로 바꿈
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

// "2026-11-16" 같은 날짜 문자열을 "2026년 11월 16일 (월)" 형식으로 바꾸는 함수
function formatKoreanDate(dateText) {
  // 날짜가 없으면 확인 불가로 표시
  if (!dateText) return '확인 불가';
  // 문자열을 날짜 객체로 변환 (시간대 문제를 피하려고 자정 시간을 붙임)
  const date = new Date(`${dateText}T00:00:00`);
  // 날짜로 바꿀 수 없는 값이면 확인 불가
  if (Number.isNaN(date.getTime())) return '확인 불가';
  // 요일 이름 배열
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  // "연 월 일 (요일)" 형식으로 돌려줌
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
}

// 시각을 "5분 전", "3시간 전"처럼 사람이 읽기 쉬운 말로 바꾸는 함수
function formatTimeAgo(date) {
  // 시각이 없으면 확인 불가
  if (!date) return '확인 불가';
  // 지금과의 차이를 분 단위로 계산
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  // 1분 미만이면 "방금 전"
  if (minutes < 1) return '방금 전';
  // 1시간 미만이면 "N분 전"
  if (minutes < 60) return `${minutes}분 전`;
  // 하루 미만이면 "N시간 전"
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  // 그 이상이면 "N일 전"
  return `${Math.floor(minutes / 60 / 24)}일 전`;
}

// 자료가 오래되었는지 판단하는 함수 (마지막 확인 시점 + 출처별 허용 시간 기준)
function isDataStale(bundle) {
  // 지난 시간(분)이 허용 시간보다 길면 오래된 자료
  return (Date.now() - bundle.checkedAt.getTime()) / 60000 > bundle.staleAfterMinutes;
}

// 출처·기준·기준일·확인 시점·갱신 상태를 표시줄에 그리는 함수
// state: 'loading' | 'ok' | 'failed' | 'failed-with-previous'
function renderDataMeta(container, bundle, state) {
  // 로딩 중이면 "불러오는 중" 표시만 보여줌
  if (state === 'loading') {
    // 깜빡이는 점과 함께 안내
    container.innerHTML = `<span class="meta-chip is-loading"><i class="pulse-dot"></i>최신 자료를 확인하는 중…</span>`;
    // 더 할 일이 없으니 종료
    return;
  }
  // 이전 자료도 없이 실패한 경우: 사용 불가 상태만 표시
  if (state === 'failed') {
    // 빨간 상태 칩 표시
    container.innerHTML = `<span class="meta-chip is-error">⚠️ 자료를 받을 수 없음 · 현재 사용 불가</span>`;
    // 종료
    return;
  }
  // 상태 칩: 갱신 실패 > 오래됨 > 최신 순서로 결정
  const statusChip = state === 'failed-with-previous'
    ? `<span class="meta-chip is-error">⚠️ 갱신 실패 · 이전에 확인한 자료입니다</span>`
    : isDataStale(bundle)
      ? `<span class="meta-chip is-warning">⏳ 오래된 자료 · 최신이 아닐 수 있어요</span>`
      : `<span class="meta-chip is-ok"><i class="pulse-dot"></i>최신</span>`;
  // 출처·기준·기준일·확인 시점 칩들을 한 줄로 그림 (값이 없으면 "확인 불가")
  container.innerHTML = `
    ${statusChip}
    <span class="meta-chip">출처 · ${escapeHtml(bundle.source)}</span>
    <span class="meta-chip">기준 · ${escapeHtml(bundle.basis)}</span>
    ${'baseDate' in bundle ? `<span class="meta-chip">기준일 · ${escapeHtml(bundle.baseDate || '확인 불가')}</span>` : ''}
    <span class="meta-chip" title="${bundle.checkedAt.toLocaleString('ko-KR')}">마지막 확인 · ${formatTimeAgo(bundle.checkedAt)}</span>`;
}

// 로딩 중에 보여줄 회색 반짝이는 뼈대(스켈레톤)를 그리는 함수
function renderSkeleton(container, count, className) {
  // count 개수만큼 빈 뼈대 요소를 만들어 넣음
  container.innerHTML = Array.from({ length: count }, () => `<div class="skeleton ${className}"></div>`).join('');
}

// 오류·빈 목록 등 상태 안내 상자를 그리는 함수 (retryAction 이 있으면 "다시 시도" 버튼 표시)
function renderStatusMessage(container, { icon, title, description, retryAction }) {
  // 안내 상자 HTML
  container.innerHTML = `
    <div class="status-box">
      <div class="status-icon">${icon}</div>
      <p class="status-title">${title}</p>
      <p class="status-desc">${description}</p>
      ${retryAction ? '<button type="button" class="primary-button retry-button">다시 시도</button>' : ''}
    </div>`;
  // 다시 시도 버튼이 있으면 클릭 시 retryAction 실행
  if (retryAction) container.querySelector('.retry-button').addEventListener('click', retryAction);
}

// 오류 종류에 맞는 안내 문구를 고르는 함수
function describeError(error, fallbackText) {
  // 키가 없으면 키 넣는 방법을, 그 밖에는 기본 문구를 보여줌
  return error.name === 'MissingKeyError' ? escapeHtml(error.message) : fallbackText;
}

// 제목으로 포스터 대체 색을 정하는 함수 (포스터가 없을 때 영화마다 다른 그라데이션)
function pickPosterColors(title) {
  // 제목 글자 코드를 더해 0~359 사이 색상값으로 만듦
  const hue = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  // 같은 계열의 어두운 색 → 밝은 색
  return [`hsl(${hue} 55% 30%)`, `hsl(${(hue + 40) % 360} 70% 55%)`];
}

// 포스터 HTML을 만드는 함수 (실제 포스터가 있으면 이미지, 없으면 그라데이션 + 제목)
function createPosterHtml(movie, extraClass = '') {
  // 대체 그라데이션 색
  const [fromColor, toColor] = pickPosterColors(movie.title);
  // 포스터 HTML (이미지는 불러오면 서서히 나타남)
  return `
    <div class="poster ${extraClass}" style="--poster-from:${fromColor};--poster-to:${toColor}">
      <span class="poster-icon">🎬</span>
      <span class="poster-title">${escapeHtml(movie.title)}</span>
      ${movie.posterUrl ? createPosterImageHtml(movie.posterUrl) : ''}
    </div>`;
}

// 포스터 이미지 태그를 만드는 함수 (불러오기 실패하면 이미지를 지워 대체 그라데이션이 보이게 함)
function createPosterImageHtml(posterUrl) {
  // loading="lazy": 화면에 보일 때만 이미지 다운로드
  return `<img class="poster-image" src="${escapeHtml(posterUrl)}" alt="" loading="lazy" onload="this.classList.add('is-loaded')" onerror="this.remove()">`;
}

// 영화의 현재 상영 여부를 판단하는 함수 (어제 관객이 있었거나 현재 상영작 목록에 있으면 상영 중)
function getShowingStatus(title) {
  // 상영 중 제목 모음에 있으면 상영 중, 없으면 확인 불가 (상영 종료라고 단정할 근거는 없음)
  return showingTitles.has(normalizeTitle(title)) ? 'showing' : 'unknown';
}

// 상영 상태를 화면용 배지 HTML로 바꾸는 함수
function createShowingBadge(title) {
  // 상태에 맞는 배지 반환
  return getShowingStatus(title) === 'showing'
    ? '<span class="meta-chip is-ok">상영 중</span>'
    : '<span class="meta-chip is-warning">상영 여부 확인 불가</span>';
}

// 숫자를 0부터 목표값까지 부드럽게 올라가게 보여주는 함수 (관객 수 카운트업 효과)
function animateNumber(element, targetNumber, suffix = '') {
  // 움직임 줄이기 설정이면 바로 최종값 표시
  if (PREFERS_REDUCED_MOTION) { element.textContent = targetNumber.toLocaleString('ko-KR') + suffix; return; }
  // 애니메이션 시작 시각
  const startTime = performance.now();
  // 애니메이션 전체 길이(밀리초)
  const duration = 1200;
  // 매 프레임마다 실행되는 함수
  function updateFrame(now) {
    // 진행률(0~1) 계산
    const progress = Math.min((now - startTime) / duration, 1);
    // 끝으로 갈수록 느려지는 곡선 적용 (easeOutCubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    // 현재 값 표시
    element.textContent = Math.round(targetNumber * eased).toLocaleString('ko-KR') + suffix;
    // 아직 끝나지 않았으면 다음 프레임 예약
    if (progress < 1) requestAnimationFrame(updateFrame);
  }
  // 첫 프레임 시작
  requestAnimationFrame(updateFrame);
}

// ===== ④ 박스오피스 순위 =====

// 선택한 기간(일별/주간)의 순위를 불러와서 화면에 그리는 함수
async function loadRanking(period) {
  // 이번 요청 번호 발급
  const requestNumber = ++latestRankingRequest;
  // 출처 표시줄을 "확인 중"으로 변경
  renderDataMeta(rankingMeta, null, 'loading');
  // 이전에 성공한 자료가 없을 때만 뼈대를 보여줌
  if (!lastSuccessfulRanking[period]) renderSkeleton(rankingList, 4, 'skeleton-card');
  try {
    // 순위 자료 요청
    const bundle = await fetchBoxOffice(period);
    // 그 사이 다른 탭을 눌렀다면 이 응답은 무시
    if (requestNumber !== latestRankingRequest) return;
    // 성공한 자료를 저장
    lastSuccessfulRanking[period] = bundle;
    // 출처 표시줄 그리기
    renderDataMeta(rankingMeta, bundle, 'ok');
    // 순위 목록 그리기
    renderRankingList(bundle);
  } catch (error) {
    // 늦게 도착한 옛 응답이면 무시
    if (requestNumber !== latestRankingRequest) return;
    // 개발자 도구에 오류 기록
    console.warn('순위 불러오기 실패:', error);
    // 이전에 성공한 자료가 있으면: 이전 자료 + 갱신 실패 상태를 함께 보여줌
    if (lastSuccessfulRanking[period]) {
      renderDataMeta(rankingMeta, lastSuccessfulRanking[period], 'failed-with-previous');
      renderRankingList(lastSuccessfulRanking[period]);
      return;
    }
    // 이전 자료도 없으면: 빈 순위를 "0건"으로 오해하지 않도록 사용 불가 안내 + 다시 시도 버튼
    renderDataMeta(rankingMeta, null, 'failed');
    renderStatusMessage(rankingList, {
      icon: '📡',
      title: '박스오피스 순위를 지금 받을 수 없어요',
      description: describeError(error, '순위가 0건인 것이 아니라, 자료를 받아오지 못한 상태예요. 잠시 후 다시 시도해 주세요.'),
      retryAction: () => loadRanking(period)
    });
  }
}

// 순위 묶음을 목록 HTML로 그리는 함수
function renderRankingList(bundle) {
  // 출처는 정상 응답했지만 순위가 비어 있으면 "순위 없음" 안내
  if (bundle.items.length === 0) {
    renderStatusMessage(rankingList, { icon: '🎞️', title: '이 기간에 집계된 순위가 없어요', description: '영화진흥위원회에서 정상적으로 응답했지만 순위 영화가 0편입니다.' });
    return;
  }
  // 순위 항목마다 포스터 카드(li)를 만듦
  rankingList.innerHTML = bundle.items.map((item, index) => {
    // 순위 변동 표시 (NEW / ▲ / ▼ / -)
    const changeHtml = item.change === 'NEW' ? '<span class="rank-change is-new">NEW</span>'
      : item.change > 0 ? `<span class="rank-change is-up">▲${item.change}</span>`
      : item.change < 0 ? `<span class="rank-change is-down">▼${Math.abs(item.change)}</span>`
      : '<span class="rank-change">-</span>';
    // 카드 HTML (--delay: 순서대로 나타나는 시간차)
    return `
      <li class="boxoffice-card" style="--delay:${index * 90}ms">
        <button type="button" class="boxoffice-poster-button" data-kofic-code="${escapeHtml(item.movieCd)}" aria-label="${item.rank}위 ${escapeHtml(item.title)} 상세 보기">
          ${createPosterHtml(item)}
          <span class="rank-badge" aria-hidden="true">${item.rank}</span>
          <span class="poster-overlay"><span class="overlay-synopsis">줄거리를 불러오는 중…</span><span class="overlay-more">상세정보 보기 ›</span></span>
        </button>
        <p class="boxoffice-title">${escapeHtml(item.title)}</p>
        <p class="boxoffice-sub">개봉 ${formatKoreanDate(item.openDate)}</p>
        <p class="boxoffice-sub"><b data-count="${item.audience}">0명</b> ${bundle.label.startsWith('일별') ? '하루' : '주간'} 관객 · ${changeHtml}</p>
        <button type="button" class="detail-button" data-kofic-code="${escapeHtml(item.movieCd)}">상세정보</button>
      </li>`;
  }).join('');
  // 관객 수 카운트업 애니메이션 시작
  rankingList.querySelectorAll('[data-count]').forEach(element => animateNumber(element, Number(element.dataset.count), '명'));
  // 포스터마다 관람등급 아이콘 붙이기
  rankingList.querySelectorAll('.boxoffice-poster-button').forEach(attachGradeBadge);
  // 5위부터는 접어 두고, 순위가 4편보다 많을 때만 "더 많은 영화보기" 버튼 표시
  showMoreRanking(false);
  document.getElementById('moreRankingButton').hidden = bundle.items.length <= 4;
  // 순위마다 TMDB에서 실제 포스터·줄거리를 찾아 끼워 넣음 (못 찾으면 그라데이션·안내 문구 유지)
  bundle.items.forEach((item, index) => {
    // 포스터 검색 (실패는 조용히 무시 → 대체 포스터 유지)
    findTmdbMatch(item.title, item.openDate).catch(() => null).then(match => {
      // 이 순위의 카드 찾기 (그 사이 목록이 바뀌어 다른 영화가 됐으면 중단)
      const card = rankingList.querySelectorAll('.boxoffice-card')[index];
      if (!card || card.querySelector('[data-kofic-code]').dataset.koficCode !== item.movieCd) return;
      // 마우스를 올리면 보이는 줄거리 채우기
      card.querySelector('.overlay-synopsis').textContent = match?.overview || '줄거리를 제공할 수 없어요.';
      // 포스터 이미지 추가
      if (match?.posterUrl) card.querySelector('.poster').insertAdjacentHTML('beforeend', createPosterImageHtml(match.posterUrl));
      // 1위 포스터는 영역 배경으로도 깔아 줌
      if (index === 0) setStageBackdrop(match?.posterUrl);
    });
  });
  // 일별 순위는 "어제 관객이 있었던 영화" = 상영 중으로 기록
  if (bundle.label.startsWith('일별')) bundle.items.forEach(item => showingTitles.add(normalizeTitle(item.title)));
}

// 5위 이하 순위를 펼치거나 접는 함수
function showMoreRanking(expand) {
  // 목록에 클래스를 붙이면 CSS가 숨겨둔 카드를 보여줌
  rankingList.classList.toggle('is-expanded', expand);
  // 버튼 글자와 스크린리더 상태 갱신
  const button = document.getElementById('moreRankingButton');
  button.textContent = expand ? '접기 −' : '더 많은 영화보기 +';
  button.setAttribute('aria-expanded', String(expand));
}

// 박스오피스 영역 배경을 1위 포스터로 바꾸는 함수 (포스터가 없으면 배경을 비움)
function setStageBackdrop(posterUrl) {
  // 배경 요소 찾기
  const backdrop = document.getElementById('stageBackdrop');
  // 잠깐 투명하게 했다가 새 이미지로 바꾼 뒤 다시 나타나게 함 (교차 전환 효과)
  backdrop.classList.remove('is-visible');
  // 0.3초 뒤 이미지 교체 후 다시 보이기
  setTimeout(() => {
    backdrop.style.backgroundImage = posterUrl ? `url("${posterUrl}")` : '';
    backdrop.classList.toggle('is-visible', Boolean(posterUrl));
  }, 300);
}

// ===== ⑤ 현재 상영작 =====

// TMDB 현재 상영작을 불러와 카드로 그리는 함수
async function loadNowPlaying() {
  // 표시줄을 "확인 중"으로
  renderDataMeta(nowPlayingMeta, null, 'loading');
  // 카드 뼈대 6개 표시
  renderSkeleton(nowPlayingGrid, 6, 'skeleton-card');
  try {
    // 현재 상영작 요청
    const bundle = await fetchNowPlaying();
    // 표시줄 그리기
    renderDataMeta(nowPlayingMeta, bundle, 'ok');
    // 상영 중 제목 모음에 추가 (상세·검색에서 상영 여부 판단에 사용)
    bundle.movies.forEach(movie => showingTitles.add(normalizeTitle(movie.title)));
    // 상영작이 없으면 빈 목록 안내
    if (bundle.movies.length === 0) {
      renderStatusMessage(nowPlayingGrid, { icon: '🍿', title: '현재 상영 중인 영화가 없어요', description: 'TMDB에서 정상 응답했지만 상영 영화가 0편입니다.' });
      return;
    }
    // 영화 카드 그리기
    renderMovieCards(nowPlayingGrid, bundle.movies);
  } catch (error) {
    // 오류 기록
    console.warn('현재 상영작 불러오기 실패:', error);
    // 상영 자료를 숨기고 사용 불가 상태를 알림
    renderDataMeta(nowPlayingMeta, null, 'failed');
    renderStatusMessage(nowPlayingGrid, {
      icon: '📡',
      title: '현재 상영작 정보를 지금 사용할 수 없어요',
      description: describeError(error, '정확하지 않은 정보를 보여주지 않도록 상영 자료를 숨겼어요.'),
      retryAction: loadNowPlaying
    });
  }
}

// 영화 카드 목록을 그리는 함수 (현재 상영작·검색 결과에서 같이 사용)
function renderMovieCards(container, movies) {
  // 영화마다 카드 하나씩 만듦 (KOFIC 영화는 data-kofic-code, TMDB 영화는 data-tmdb-id 로 상세 연결)
  container.innerHTML = movies.map((movie, index) => {
    // 영화 출처와 번호 분리 ("tmdb:123" → ["tmdb", "123"])
    const [origin, id] = movie.key.split(':');
    // 카드 HTML
    return `
      <article class="movie-card" style="--delay:${index * 80}ms">
        <button type="button" class="movie-card-button" ${origin === 'tmdb' ? 'data-tmdb-id' : 'data-kofic-code'}="${escapeHtml(id)}" aria-label="${escapeHtml(movie.title)} 상세 보기">
          ${createPosterHtml(movie)}
          <span class="card-body">
            <span class="card-title">${escapeHtml(movie.title)}</span>
            <span class="card-sub">개봉 ${formatKoreanDate(movie.openDate)}</span>
            <span class="card-synopsis">${movie.overview ? escapeHtml(movie.overview) : '줄거리를 제공할 수 없어요.'}</span>
          </span>
        </button>
      </article>`;
  }).join('');
  // 카드마다 관람등급 아이콘 붙이기
  container.querySelectorAll('.movie-card-button').forEach(attachGradeBadge);
}

// ===== ⑥ 영화 상세 팝업 =====

// 영화 상세 팝업을 열고 정보를 불러오는 함수 (loadDetail: 상세 자료를 가져오는 함수)
async function openMovieDetail(loadDetail) {
  // 팝업이 닫혀 있으면 열기 (showModal: 뒤 화면을 막고 Esc로 닫을 수 있음)
  if (!movieDialog.open) movieDialog.showModal();
  // 로딩 중 표시
  dialogBody.innerHTML = '<div class="dialog-loading"><div class="film-reel small"><span></span><span></span><span></span><span></span><span></span></div><p>영화 정보를 불러오는 중…</p></div>';
  try {
    // 영화 상세 정보 요청 후 화면 그리기
    renderMovieDetail(await loadDetail());
  } catch (error) {
    // 오류 기록
    console.warn('영화 정보 불러오기 실패:', error);
    // 실패 안내 + 다시 시도 버튼
    renderStatusMessage(dialogBody, { icon: '🎬', title: '영화 정보를 불러오지 못했어요', description: describeError(error, '잠시 후 다시 시도해 주세요.'), retryAction: () => openMovieDetail(loadDetail) });
  }
}

// 영화 상세 정보 화면을 그리는 함수
function renderMovieDetail(movie) {
  // 기본 정보 항목들 (값이 없으면 "확인 불가")
  const facts = [['장르', movie.genres], ['관람등급', movie.grade], ['상영시간', movie.runtime && `${movie.runtime}분`], ['개봉일', movie.openDate && formatKoreanDate(movie.openDate)], ['감독', movie.directors], ['출연', movie.actors]];
  // 상세 화면 HTML
  dialogBody.innerHTML = `
    <div class="detail-view view-enter">
      <div class="detail-backdrop" style="--poster-from:${pickPosterColors(movie.title)[1]}"></div>
      <div class="detail-layout">
        ${createPosterHtml(movie, 'poster-large')}
        <div class="detail-info">
          <div class="detail-badges">${createShowingBadge(movie.title)}<span class="meta-chip">출처 · ${escapeHtml(movie.source)}</span></div>
          <h2 id="dialogTitle" class="detail-title">${createGradeBadge(movie.grade)}${escapeHtml(movie.title)}</h2>
          <dl class="detail-facts">
            ${facts.map(([name, value]) => `<div><dt>${name}</dt><dd>${value ? escapeHtml(value) : '<span class="muted">확인 불가</span>'}</dd></div>`).join('')}
          </dl>
          <h3 class="detail-subtitle">줄거리</h3>
          <p class="detail-synopsis">${movie.overview ? escapeHtml(movie.overview) : '<span class="muted">이 영화의 줄거리는 현재 제공할 수 없어요.</span>'}</p>
          <h3 class="detail-subtitle">예매할 수 있는 영화관</h3>
          <p class="muted small-text">영화관별 상영 여부는 공개 데이터가 없어요. 네이버 검색에서 지금 상영 중인 극장과 시간을 확인하거나, 영화관에서 바로 예매하세요.</p>
          <div class="theater-links">
            <a class="primary-button" href="https://search.naver.com/search.naver?query=${encodeURIComponent(`${movie.title} 상영관`)}" target="_blank" rel="noopener">📍 네이버에서 상영관 찾기 ↗</a>
            <a class="ghost-button" href="https://www.cgv.co.kr/" target="_blank" rel="noopener">CGV ↗</a>
            <a class="ghost-button" href="https://www.megabox.co.kr/" target="_blank" rel="noopener">메가박스 ↗</a>
            <a class="ghost-button" href="https://www.lottecinema.co.kr/" target="_blank" rel="noopener">롯데시네마 ↗</a>
          </div>
        </div>
      </div>
      <section class="trailer-section">
        <div class="trailer-head">
          <h3 class="detail-subtitle">예고편 · 광고 영상</h3>
          <a class="youtube-search-link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} 예고편`)}" target="_blank" rel="noopener">유튜브에서 더 찾아보기 ↗</a>
        </div>
        <div class="trailer-list" id="trailerList"><div class="skeleton trailer-skeleton"></div><div class="skeleton trailer-skeleton"></div><div class="skeleton trailer-skeleton"></div></div>
      </section>
    </div>`;
  // 예고편 목록 불러오기
  loadTrailers(movie.tmdbId);
}

// 예고편 썸네일 목록을 그리는 함수 (썸네일을 누르면 그 자리에서 유튜브 영상 재생)
async function loadTrailers(tmdbId) {
  // 예고편을 넣을 영역
  const trailerList = document.getElementById('trailerList');
  // 영상 종류 한국어 이름
  const typeNames = { Trailer: '예고편', Teaser: '티저', Clip: '클립', Featurette: '메이킹' };
  try {
    // TMDB에서 이 영화를 못 찾았으면 영상도 없음
    const videos = tmdbId ? await fetchTrailers(tmdbId) : [];
    // 기다리는 사이 팝업이 다른 영화로 바뀌었으면 중단
    if (!trailerList.isConnected) return;
    // 영상이 없으면 안내 (위의 "유튜브에서 더 찾아보기" 링크는 그대로 이용 가능)
    if (videos.length === 0) { trailerList.innerHTML = '<p class="muted small-text">등록된 예고편이 없어요. 유튜브에서 직접 찾아보세요.</p>'; return; }
    // 썸네일 버튼 목록 (유튜브 썸네일 이미지 + 재생 아이콘 + 영상 이름)
    trailerList.innerHTML = videos.map((video, index) => `
      <div class="trailer-card" style="--delay:${index * 70}ms">
        <button type="button" class="trailer-thumb" data-youtube-key="${escapeHtml(video.key)}" data-title="${escapeHtml(video.name)}" aria-label="${escapeHtml(video.name)} 재생">
          <img src="https://i.ytimg.com/vi/${encodeURIComponent(video.key)}/hqdefault.jpg" alt="" loading="lazy">
          <span class="trailer-play" aria-hidden="true">▶</span>
          <span class="trailer-type">${typeNames[video.type]}</span>
        </button>
        <span class="trailer-name">${escapeHtml(video.name)}</span>
      </div>`).join('');
  } catch (error) {
    // 영상 목록을 못 받으면 안내
    if (trailerList.isConnected) trailerList.innerHTML = '<p class="muted small-text">예고편 목록을 불러오지 못했어요. 유튜브에서 직접 찾아보세요.</p>';
  }
}

// 썸네일 자리에 유튜브 플레이어를 넣어 재생하는 함수
function playTrailer(thumbButton) {
  // 유튜브 영상 번호
  const videoKey = encodeURIComponent(thumbButton.dataset.youtubeKey);
  // 파일을 직접 연 경우(file://)엔 유튜브가 페이지 출처를 몰라 재생을 막음(오류 153) → 유튜브 새 탭으로 열기
  if (location.protocol === 'file:') { window.open(`https://www.youtube.com/watch?v=${videoKey}`, '_blank', 'noopener'); return; }
  // 썸네일 버튼을 유튜브 플레이어로 교체 (referrerpolicy: 유튜브가 요구하는 출처 정보 전달)
  thumbButton.outerHTML = `<iframe class="trailer-player" src="https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0" title="${escapeHtml(thumbButton.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

// 팝업 닫기 함수 (닫히는 애니메이션이 끝난 뒤 실제로 닫음)
function closeMovieDialog() {
  // 닫힘 애니메이션용 클래스 추가
  movieDialog.classList.add('is-closing');
  // 0.25초 뒤 실제로 닫고 클래스 제거
  setTimeout(() => { movieDialog.close(); movieDialog.classList.remove('is-closing'); }, PREFERS_REDUCED_MOTION ? 0 : 250);
}

// ===== ⑦ 영화 검색 =====

// 검색 대상(일별 박스오피스 + 현재 상영작)을 모아 오는 함수
async function collectSearchableMovies() {
  // 두 자료를 동시에 요청 (한쪽이 실패해도 다른 쪽으로 검색)
  const [boxOffice, nowPlaying] = await Promise.allSettled([fetchBoxOffice('daily'), fetchNowPlaying()]);
  // 둘 다 실패하면 검색 불가
  if (boxOffice.status === 'rejected' && nowPlaying.status === 'rejected') throw boxOffice.reason;
  // 현재 상영작(포스터·줄거리 있음)을 먼저 넣음
  const movies = nowPlaying.status === 'fulfilled' ? [...nowPlaying.value.movies] : [];
  // 같은 영화가 두 번 나오지 않도록 이미 넣은 제목 기록
  const addedTitles = new Set(movies.map(movie => normalizeTitle(movie.title)));
  // 박스오피스 영화 중 아직 없는 것만 추가 (순위 화면에서 이미 찾아 둔 TMDB 포스터·줄거리 재사용)
  if (boxOffice.status === 'fulfilled') {
    // 현재 상영작 목록에 없는 박스오피스 영화만 고름
    const extraItems = boxOffice.value.items.filter(item => !addedTitles.has(normalizeTitle(item.title)));
    // 각 영화의 TMDB 포스터·줄거리 (못 찾으면 null)
    const matches = await Promise.all(extraItems.map(item => findTmdbMatch(item.title, item.openDate).catch(() => null)));
    // 검색 대상에 추가
    extraItems.forEach((item, index) => movies.push({ key: `kofic:${item.movieCd}`, title: item.title, openDate: item.openDate, posterUrl: matches[index]?.posterUrl || null, overview: matches[index]?.overview || null }));
  }
  // 모은 영화 목록 반환
  return movies;
}

// 검색 폼 제출 시 실행되는 함수
async function handleSearchSubmit(event) {
  // 폼 제출 시 페이지가 새로고침되지 않도록 막음
  event.preventDefault();
  // 입력한 검색어 가져오기 (앞뒤 공백 제거)
  const keyword = document.getElementById('movieSearchInput').value.trim();
  // 검색어가 비어 있으면 안내만 하고 종료
  if (!keyword) { searchStatusText.textContent = '영화 제목을 입력해 주세요.'; searchResultGrid.innerHTML = ''; return; }
  // 검색 중 안내
  searchStatusText.textContent = '검색 중…';
  try {
    // 검색 대상 영화 모으기
    const movies = await collectSearchableMovies();
    // 제목에 검색어가 들어간 영화만 남김 (띄어쓰기·기호·대소문자 무시)
    const results = movies.filter(movie => normalizeTitle(movie.title).includes(normalizeTitle(keyword)));
    // 결과가 있으면 개수 안내 후 카드 표시
    if (results.length > 0) {
      searchStatusText.textContent = `'${keyword}' 검색 결과 ${results.length}편`;
      renderMovieCards(searchResultGrid, results);
      return;
    }
    // 결과가 없으면: 안내 + 현재 상영작 앞쪽 3편 추천
    searchStatusText.textContent = `'${keyword}'와 일치하는 상영 영화가 없어요. 이런 영화는 어떠세요?`;
    renderMovieCards(searchResultGrid, movies.slice(0, 3));
  } catch (error) {
    // 검색 대상 자료를 받지 못했을 때 안내
    searchStatusText.textContent = error.name === 'MissingKeyError' ? error.message : '영화 목록을 받지 못해 지금은 검색할 수 없어요. 잠시 후 다시 시도해 주세요.';
    searchResultGrid.innerHTML = '';
  }
}

// ===== ⑧ 메뉴·탭 =====

// 모바일 메뉴를 열거나 닫는 함수 (shouldOpen 을 주지 않으면 현재 상태 반대로)
function toggleMobileMenu(shouldOpen) {
  // 버튼 찾기
  const menuButton = document.getElementById('menuToggle');
  // 열지 닫을지 결정
  const open = typeof shouldOpen === 'boolean' ? shouldOpen : menuButton.getAttribute('aria-expanded') !== 'true';
  // 스크린리더용 상태 갱신
  menuButton.setAttribute('aria-expanded', String(open));
  // 버튼 이름도 상태에 맞게 변경
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  // body에 클래스를 붙여 CSS가 메뉴를 펼치게 함
  document.body.classList.toggle('menu-open', open);
}

// 탭 그룹을 동작하게 만드는 함수 (onSelect: 탭을 고르면 실행할 함수)
function setupTabs(tabGroup, onSelect) {
  // 그룹 안의 탭 버튼들
  const buttons = tabGroup.querySelectorAll('.tab-button');
  // 각 탭 버튼에 클릭 이벤트 연결
  buttons.forEach(button => button.addEventListener('click', () => {
    // 모든 탭의 선택 상태 해제
    buttons.forEach(other => { other.classList.remove('is-active'); other.setAttribute('aria-selected', 'false'); });
    // 누른 탭만 선택 상태로
    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
    // 표시 막대를 누른 탭 아래로 이동
    moveTabIndicator(tabGroup);
    // 해당 탭의 자료 불러오기
    onSelect(button);
  }));
  // 처음 위치 맞추기
  moveTabIndicator(tabGroup);
}

// 탭 표시 막대를 선택된 탭 위치·너비에 맞추는 함수
function moveTabIndicator(tabGroup) {
  // 선택된 탭과 표시 막대 찾기
  const activeButton = tabGroup.querySelector('.tab-button.is-active');
  const indicator = tabGroup.querySelector('.tab-indicator');
  // 막대의 위치와 너비를 선택된 탭과 같게 설정 (CSS transition 으로 미끄러짐)
  indicator.style.width = `${activeButton.offsetWidth}px`;
  indicator.style.transform = `translateX(${activeButton.offsetLeft}px)`;
}

// ===== ⑨ 모션 효과 =====

// 스크롤해서 화면에 들어온 요소를 부드럽게 나타나게 하는 함수
function setupScrollReveal() {
  // 화면에 보이는지 감시하는 관찰자 생성
  const observer = new IntersectionObserver(entries => {
    // 보이게 된 요소마다
    entries.forEach(entry => {
      // 화면에 들어왔으면 나타나는 클래스 추가 후 감시 중단
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  // reveal 클래스가 붙은 모든 요소 감시 시작
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

// 페이지 상단의 스크롤 진행률 막대 + 스크롤 시 상단 바 스타일 변경
function setupScrollEffects() {
  // 진행률 막대와 상단 바 찾기
  const progressBar = document.getElementById('scrollProgress');
  const topBar = document.getElementById('topBar');
  // 박스오피스 흐린 배경 (패럴랙스 효과용)
  const backdrop = document.getElementById('stageBackdrop');
  // 스크롤할 때마다 실행
  window.addEventListener('scroll', () => {
    // 전체 스크롤 가능 길이 대비 현재 위치 비율
    const ratio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    // 막대 너비를 비율만큼 늘림
    progressBar.style.transform = `scaleX(${ratio})`;
    // 조금이라도 내려가면 상단 바에 배경을 깔아줌
    topBar.classList.toggle('is-scrolled', window.scrollY > 20);
    // 흐린 배경을 스크롤보다 느리게 움직여 깊이감 표현
    if (!PREFERS_REDUCED_MOTION) backdrop.style.translate = `0 ${window.scrollY * 0.3}px`;
  }, { passive: true });
}

// 마우스를 따라다니는 빛 효과 (마우스가 있는 기기에서만)
function setupCursorGlow() {
  // 마우스가 없는 기기(터치폰)거나 움직임 줄이기 설정이면 생략
  if (!window.matchMedia('(pointer: fine)').matches || PREFERS_REDUCED_MOTION) return;
  // 빛 요소 찾기
  const glow = document.getElementById('cursorGlow');
  // 마우스가 움직이면 빛 위치를 마우스 좌표로 이동
  window.addEventListener('pointermove', event => {
    glow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  }, { passive: true });
}

// 카드에 마우스를 올리면 마우스 방향으로 살짝 기울어지는 3D 효과
function setupCardTilt() {
  // 마우스가 없거나 움직임 줄이기면 생략
  if (!window.matchMedia('(pointer: fine)').matches || PREFERS_REDUCED_MOTION) return;
  // 문서 전체에서 마우스 움직임 감지 (나중에 추가되는 카드에도 적용되도록)
  document.addEventListener('pointermove', event => {
    // 마우스 아래에 있는 카드 찾기
    const card = event.target.closest('.movie-card-button');
    // 카드가 아니면 종료
    if (!card) return;
    // 카드 크기·위치
    const rect = card.getBoundingClientRect();
    // 카드 안 마우스 위치를 -0.5 ~ 0.5 범위로 계산
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    // 기울기와 빛 반사 위치를 CSS 변수로 전달
    card.style.setProperty('--tilt-x', `${-y * 10}deg`);
    card.style.setProperty('--tilt-y', `${x * 10}deg`);
    card.style.setProperty('--shine-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--shine-y', `${(y + 0.5) * 100}%`);
  });
  // 마우스가 카드에서 벗어나면 기울기 원위치
  document.addEventListener('pointerout', event => {
    // 벗어난 요소가 카드면
    const card = event.target.closest('.movie-card-button');
    // 카드 안의 다른 요소로 이동한 게 아니면 초기화
    if (card && !card.contains(event.relatedTarget)) { card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg'); }
  });
}

// 인트로 로딩 화면을 사라지게 하는 함수
function hideIntroLoader() {
  // 로딩 화면 찾기
  const loader = document.getElementById('introLoader');
  // 사라지는 클래스 추가 (CSS가 위로 걷히는 애니메이션 실행)
  loader.classList.add('is-hidden');
  // 애니메이션이 끝나면 화면에서 완전히 제거
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  // 본문 등장 애니메이션 시작 신호
  document.body.classList.add('is-loaded');
}

// ===== ⑩ 시작: 페이지가 준비되면 모든 기능 연결 =====

// 화면 기능을 한꺼번에 연결하는 시작 함수
function startApp() {
  // "더 많은 영화보기" 버튼: 누를 때마다 펼치기/접기
  document.getElementById('moreRankingButton').addEventListener('click', () => showMoreRanking(!rankingList.classList.contains('is-expanded')));

  // 순위 탭: 탭을 고르면 해당 기간(일별/주간) 순위를 불러옴
  setupTabs(document.getElementById('rankingTabs'), button => loadRanking(button.dataset.period));
  // 창 크기가 바뀌면 탭 표시 막대 위치 다시 맞춤
  window.addEventListener('resize', () => document.querySelectorAll('.tab-group').forEach(moveTabIndicator));

  // 처음 화면에 일별 박스오피스와 현재 상영작 표시
  loadRanking('daily');
  loadNowPlaying();

  // 순위 줄·영화 카드를 누르면 상세 팝업 열기 (화면 전체에 한 번만 연결)
  document.addEventListener('click', event => {
    // KOFIC 영화(박스오피스)를 눌렀으면 KOFIC 상세로
    const koficButton = event.target.closest('[data-kofic-code]');
    if (koficButton) openMovieDetail(() => getKoficDetail(koficButton.dataset.koficCode));
    // TMDB 영화(현재 상영작)를 눌렀으면 TMDB 상세로
    const tmdbButton = event.target.closest('[data-tmdb-id]');
    if (tmdbButton) openMovieDetail(() => getTmdbDetail(tmdbButton.dataset.tmdbId));
  });

  // 팝업 닫기 버튼
  document.getElementById('dialogCloseButton').addEventListener('click', closeMovieDialog);
  // 팝업 바깥(어두운 배경)을 누르면 닫기
  movieDialog.addEventListener('click', event => { if (event.target === movieDialog) closeMovieDialog(); });
  // 팝업 안 예고편 썸네일을 누르면 재생
  dialogBody.addEventListener('click', event => {
    const thumbButton = event.target.closest('.trailer-thumb');
    if (thumbButton) playTrailer(thumbButton);
  });
  // 팝업이 닫히면 내용 비우기 (재생 중인 예고편 소리를 멈춤)
  movieDialog.addEventListener('close', () => { dialogBody.innerHTML = ''; });

  // 검색 폼 제출 연결
  document.getElementById('movieSearchForm').addEventListener('submit', handleSearchSubmit);

  // 모바일 메뉴 버튼 연결
  document.getElementById('menuToggle').addEventListener('click', () => toggleMobileMenu());
  // 메뉴 항목을 누르면 메뉴 자동으로 접기
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => toggleMobileMenu(false)));

  // 모션 효과 연결
  setupScrollReveal();
  setupScrollEffects();
  setupCursorGlow();
  setupCardTilt();

  // 인트로를 잠깐 보여준 뒤 걷어냄 (움직임 줄이기 설정이면 바로)
  setTimeout(hideIntroLoader, PREFERS_REDUCED_MOTION ? 0 : 1400);
}

// HTML이 모두 준비되면 시작 함수 실행
document.addEventListener('DOMContentLoaded', startApp);
