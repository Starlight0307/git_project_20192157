/* =========================================================
   lotto.js - 로또 번호 생성, 결과 표시, 복사, 초기화, 기록 관리
   ---------------------------------------------------------
   [번호 뽑기] 버튼을 누르면 실행되는 순서
     1) 추첨기(machine.js)가 공을 섞기 시작
     2) 1~45 중 중복 없는 번호 7개를 뽑음 (앞 6개 = 당첨 번호, 마지막 1개 = 보너스)
     3) 공을 하나씩 추첨기에서 꺼내 결과 칸에 떨어뜨림
     4) 당첨 번호 6개를 오름차순으로 정렬해 다시 보여줌
     5) 생성 횟수 +1, 기록에 저장
   ========================================================= */

// ---------------------------------------------------------
// 1. 설정값 (숫자를 바꾸면 동작이 바뀜)
// ---------------------------------------------------------
const MIN_NUMBER = 1;       // 가장 작은 번호
const MAX_NUMBER = 45;      // 가장 큰 번호
const MAIN_COUNT = 6;       // 당첨 번호 개수
const DRAW_DELAY = 900;     // 공 하나를 꺼내는 간격 (밀리초, 1000 = 1초)
const MIX_TIME = 1500;      // 첫 공을 꺼내기 전 섞는 시간 (밀리초)
const MAX_HISTORY = 100;    // 기록을 최대 몇 개까지 저장할지
const STORAGE_KEY = "lottoHistory"; // 브라우저 저장소(localStorage)에 기록을 저장할 이름
const COUNT_KEY = "lottoDrawCount"; // 브라우저 저장소에 생성 횟수를 저장할 이름

// ---------------------------------------------------------
// 2. 화면 요소 가져오기 (HTML의 id로 찾음)
// ---------------------------------------------------------
const slots = document.querySelectorAll(".slot");            // 결과 칸 7개 (0~5: 당첨, 6: 보너스)
const statusText = document.getElementById("status");         // 진행 상황 안내 문구
const drawBtn = document.getElementById("drawBtn");           // [번호 뽑기] 버튼
const copyBtn = document.getElementById("copyBtn");           // [번호 복사] 버튼
const resetBtn = document.getElementById("resetBtn");         // [초기화] 버튼
const clearHistoryBtn = document.getElementById("clearHistoryBtn"); // [기록 전체 삭제] 버튼
const countEl = document.getElementById("drawCount");         // 생성 횟수 숫자
const historyEl = document.getElementById("history");         // 기록 목록
const historyEmptyEl = document.getElementById("historyEmpty"); // "기록 없음" 문구
const outlet = document.getElementById("outlet");             // 추첨기 배출구
const machineEl = document.getElementById("machine");         // 추첨기 전체 상자 (섞는 중 진동 효과용)
const toast = document.getElementById("toast");               // 알림 메시지

// ---------------------------------------------------------
// 3. 상태 변수 (게임 진행 중 바뀌는 값)
// ---------------------------------------------------------
let isDrawing = false;   // 지금 추첨 애니메이션이 진행 중인지 (진행 중엔 버튼을 막음)
let currentResult = null; // 화면에 보이는 현재 결과 { main: [6개], bonus: 숫자 }, 없으면 null
// 저장된 생성 횟수와 기록을 불러옴 (처음이면 0과 빈 배열)
let drawCount = Number(localStorage.getItem(COUNT_KEY)) || 0;
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// ---------------------------------------------------------
// 4. 도구 함수
// ---------------------------------------------------------

/** ms 밀리초 동안 기다린다. async 함수 안에서 `await wait(1000)` 처럼 사용 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 번호 구간에 맞는 색상 클래스 이름을 돌려준다 (style.css의 .ball.c1 ~ .c5와 연결)
 * 1~10 → c1(노랑), 11~20 → c2(파랑), 21~30 → c3(빨강), 31~40 → c4(회색), 41~45 → c5(초록)
 */
function colorClass(n) {
  return "c" + Math.ceil(n / 10);
}

/** 번호 n을 표시하는 공 HTML 요소를 만들어 돌려준다 */
function createBall(n) {
  const ball = document.createElement("div");
  ball.className = "ball " + colorClass(n);
  ball.textContent = n;
  return ball;
}

/** 화면 아래에 짧은 알림 메시지를 2초 동안 띄운다 */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer); // 이전 알림 타이머가 남아 있으면 취소
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2000);
}

/** 버튼들의 사용 가능 여부를 현재 상태에 맞게 바꾼다 */
function updateButtons() {
  drawBtn.disabled = isDrawing;                          // 추첨 중에는 다시 못 누름
  copyBtn.disabled = isDrawing || !currentResult;        // 결과가 있어야 복사 가능
  resetBtn.disabled = isDrawing || !currentResult;       // 결과가 있어야 초기화 가능
  clearHistoryBtn.disabled = isDrawing || history.length === 0;
}

// ---------------------------------------------------------
// 5. 핵심: 번호 생성
// ---------------------------------------------------------

/**
 * 1~45 중 중복 없는 번호 7개를 뽑는다.
 * 방법: 1~45가 들어 있는 배열을 무작위로 섞은 뒤(피셔-예이츠 셔플), 앞에서 7개를 꺼냄.
 *       한 번 섞은 배열에서 꺼내므로 같은 번호가 두 번 나올 수 없다.
 * 반환: { main: 당첨 번호 6개(뽑힌 순서), bonus: 보너스 번호 1개 }
 */
function generateNumbers() {
  // [1, 2, 3, ..., 45] 배열 만들기
  const pool = [];
  for (let n = MIN_NUMBER; n <= MAX_NUMBER; n++) pool.push(n);

  // 피셔-예이츠 셔플: 뒤에서부터 하나씩, 자기 앞의 랜덤한 칸과 자리를 바꿈
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 ~ i 사이 랜덤 위치
    [pool[i], pool[j]] = [pool[j], pool[i]];       // 두 값 맞바꾸기
  }

  return {
    main: pool.slice(0, MAIN_COUNT), // 앞 6개
    bonus: pool[MAIN_COUNT],         // 7번째
  };
}

/**
 * 뽑힌 결과가 규칙에 맞는지 검사한다 (설계표의 확인 기준).
 * 문제가 있으면 개발자 도구(F12) 콘솔에 오류를 표시한다.
 */
function verifyResult(result) {
  const all = [...result.main, result.bonus];
  const checks = {
    "번호 6개": result.main.length === MAIN_COUNT,
    "보너스 1개": typeof result.bonus === "number",
    "1~45 범위": all.every((n) => n >= MIN_NUMBER && n <= MAX_NUMBER),
    "중복 없음": new Set(all).size === all.length,
    "오름차순 정렬": result.main.every((n, i) => i === 0 || result.main[i - 1] < n),
  };
  for (const [name, ok] of Object.entries(checks)) {
    if (!ok) console.error("[로또 검사 실패] " + name, result);
  }
  return Object.values(checks).every(Boolean);
}

// ---------------------------------------------------------
// 6. 화면 표시
// ---------------------------------------------------------

/** 결과 칸 index번에 번호 n의 공을 떨어지는 애니메이션과 함께 넣는다 */
function dropBall(index, n) {
  const ball = createBall(n);
  ball.classList.add("drop");
  slots[index].innerHTML = "";
  slots[index].appendChild(ball);

  // 공이 칸에 "착지"하는 순간(0.5초 후) 빛 고리가 퍼지게 함
  setTimeout(() => {
    const ring = document.createElement("span");
    ring.className = "burst-ring";
    slots[index].appendChild(ring);
    setTimeout(() => ring.remove(), 700); // 애니메이션이 끝나면 삭제
  }, 500);
}

/** 추첨이 끝나면 결과 공 7개가 왼쪽부터 차례로 통통 튀며 축하하는 효과 */
async function cheerBalls() {
  for (const slot of slots) {
    const ball = slot.querySelector(".ball");
    ball.classList.remove("drop", "flip", "cheer");
    void ball.offsetWidth; // 애니메이션을 처음부터 다시 실행하기 위한 요령
    ball.classList.add("cheer");
    await wait(70);
  }
}

/** 추첨기 배출구를 잠깐 빛나게 한다 (공이 나오는 느낌) */
function flashOutlet() {
  outlet.classList.add("flash");
  setTimeout(() => outlet.classList.remove("flash"), 300);
}

/**
 * 당첨 번호 6칸을 오름차순으로 다시 보여준다.
 * 각 공이 반쯤 뒤집혔을 때 번호와 색을 바꿔서 "뒤집히며 정렬되는" 효과를 줌.
 */
async function showSorted(sorted) {
  for (let i = 0; i < MAIN_COUNT; i++) {
    const ball = slots[i].querySelector(".ball");
    ball.classList.remove("drop", "flip");
    void ball.offsetWidth;     // 애니메이션을 처음부터 다시 실행하기 위한 요령
    ball.classList.add("flip");
    setTimeout(() => {         // 뒤집기 애니메이션(0.6초)의 절반 지점에서 번호 교체
      ball.textContent = sorted[i];
      ball.className = "ball flip " + colorClass(sorted[i]);
    }, 300);
    await wait(80);            // 공마다 조금씩 늦게 뒤집혀 물결처럼 보이게
  }
  await wait(600);
}

/** 생성 횟수 숫자를 갱신하고 튀는 효과를 준다 */
function renderCount() {
  countEl.textContent = drawCount;
  countEl.classList.remove("bump");
  void countEl.offsetWidth;
  countEl.classList.add("bump");
}

/**
 * 기록 목록을 다시 그린다.
 * isNew가 true면 맨 위(가장 최근) 기록에 등장 애니메이션을 준다.
 */
function renderHistory(isNew) {
  historyEl.innerHTML = "";
  history.forEach((record, i) => {
    const li = document.createElement("li");
    if (isNew && i === 0) li.classList.add("new");

    // 회차 번호와 생성 시각
    li.innerHTML = `<span class="round">${record.round}회</span><span class="time">${record.time}</span>`;

    // 작은 공 6개 + 보너스
    const balls = document.createElement("div");
    balls.className = "mini-balls";
    [...record.main, record.bonus].forEach((n, k) => {
      if (k === MAIN_COUNT) {
        // 당첨 번호 6개 다음에 "+" 표시
        const plus = document.createElement("span");
        plus.className = "plus";
        plus.textContent = "+";
        balls.appendChild(plus);
      }
      const ball = createBall(n);
      ball.style.animationDelay = 0.2 + k * 0.07 + "s"; // 새 기록이면 공이 하나씩 차례로 튀어나옴
      balls.appendChild(ball);
    });
    li.appendChild(balls);

    // 기록마다 복사 버튼
    const copy = document.createElement("button");
    copy.className = "btn small";
    copy.textContent = "복사";
    copy.addEventListener("click", () => copyNumbers(record));
    li.appendChild(copy);

    historyEl.appendChild(li);
  });
  historyEmptyEl.style.display = history.length ? "none" : "block"; // 기록이 없으면 안내 문구 표시
}

/** 기록과 생성 횟수를 브라우저 저장소에 저장 (새로고침해도 남아 있음) */
function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  localStorage.setItem(COUNT_KEY, drawCount);
}

// ---------------------------------------------------------
// 7. 버튼 기능
// ---------------------------------------------------------

/** [번호 뽑기]: 추첨 애니메이션 전체를 순서대로 실행 */
async function drawLotto() {
  if (isDrawing) return; // 이미 추첨 중이면 무시
  isDrawing = true;
  currentResult = null;
  updateButtons();

  // 이전 결과 지우기 + 추첨기에 공 다시 채우기
  slots.forEach((slot) => (slot.innerHTML = ""));
  LottoMachine.refill();

  // 1) 섞기
  statusText.textContent = "공을 섞는 중...";
  statusText.classList.remove("done");
  statusText.classList.add("active");
  LottoMachine.startMix();
  machineEl.classList.add("mixing"); // 추첨기 진동 + 빛 회전 빨라짐 + 전구 빠르게 깜빡임
  await wait(MIX_TIME);

  // 2) 번호 뽑기
  const result = generateNumbers();
  const drawOrder = [...result.main, result.bonus]; // 꺼낼 순서 (당첨 6개 → 보너스)

  // 3) 하나씩 꺼내서 결과 칸에 표시
  for (let i = 0; i < drawOrder.length; i++) {
    const n = drawOrder[i];
    statusText.textContent = i < MAIN_COUNT ? `${i + 1}번째 번호 추첨 중...` : "보너스 번호 추첨 중...";
    await wait(DRAW_DELAY);
    LottoMachine.removeBall(n); // 추첨기에서 공 제거
    flashOutlet();
    dropBall(i, n);             // 결과 칸에 공 등장
  }
  LottoMachine.stopMix();
  machineEl.classList.remove("mixing");
  await wait(900);

  // 4) 당첨 번호 오름차순 정렬
  statusText.textContent = "오름차순으로 정렬 중...";
  const sorted = [...result.main].sort((a, b) => a - b); // 숫자 정렬은 (a, b) => a - b 필요
  await showSorted(sorted);
  currentResult = { main: sorted, bonus: result.bonus };
  verifyResult(currentResult);

  // 5) 생성 횟수 증가 + 기록 저장 (최신 기록이 맨 위)
  drawCount++;
  const now = new Date();
  history.unshift({
    round: drawCount,
    main: currentResult.main,
    bonus: currentResult.bonus,
    time: now.toLocaleDateString("ko-KR") + " " + now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
  });
  history = history.slice(0, MAX_HISTORY); // 너무 많으면 오래된 기록부터 버림
  saveHistory();
  renderCount();
  renderHistory(true);

  statusText.classList.remove("active");
  statusText.classList.add("done");
  statusText.textContent = `🎉 ${drawCount}번째 번호가 생성되었습니다!`;
  Effects.confetti(); // 꽃가루 터뜨리기 (effects.js)
  cheerBalls();       // 결과 공들이 차례로 통통 튀기
  isDrawing = false;
  updateButtons();
}

/**
 * [번호 복사]: 번호를 "3, 11, 19, 27, 38, 42 + 보너스 7" 형태 글자로 클립보드에 복사
 * result를 주지 않으면 현재 화면의 결과를 복사
 */
async function copyNumbers(result = currentResult) {
  if (!result) return;
  const text = `${result.main.join(", ")} + 보너스 ${result.bonus}`;
  try {
    await navigator.clipboard.writeText(text); // 최신 브라우저의 복사 기능
  } catch {
    // 일부 환경(파일로 직접 연 경우 등)에서 위 방법이 막히면, 임시 입력칸을 만들어 복사
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  showToast("📋 복사 완료: " + text);
}

/** [초기화]: 화면에 표시된 번호를 지운다 (생성 횟수와 기록은 그대로 유지) */
async function resetNumbers() {
  if (isDrawing || !currentResult) return;
  // 공이 작아지며 사라지는 애니메이션 후 칸 비우기
  slots.forEach((slot) => slot.querySelector(".ball")?.classList.add("vanish"));
  await wait(350);
  slots.forEach((slot) => (slot.innerHTML = ""));
  currentResult = null;
  LottoMachine.refill(); // 추첨기에 공 45개를 다시 채움
  statusText.classList.remove("done");
  statusText.textContent = "초기화되었습니다. 다시 번호를 뽑아보세요!";
  updateButtons();
}

/** [기록 전체 삭제]: 생성 기록과 생성 횟수를 모두 지운다 */
function clearHistory() {
  if (!confirm("생성 기록과 생성 횟수를 모두 삭제할까요?")) return;
  history = [];
  drawCount = 0;
  saveHistory();
  renderCount();
  renderHistory(false);
  updateButtons();
  showToast("🗑️ 기록이 삭제되었습니다");
}

// ---------------------------------------------------------
// 8. 버튼에 기능 연결 + 처음 화면 표시
// ---------------------------------------------------------
drawBtn.addEventListener("click", drawLotto);
copyBtn.addEventListener("click", () => copyNumbers());
resetBtn.addEventListener("click", resetNumbers);
clearHistoryBtn.addEventListener("click", clearHistory);

countEl.textContent = drawCount; // 저장돼 있던 생성 횟수 표시
renderHistory(false);            // 저장돼 있던 기록 표시
updateButtons();
