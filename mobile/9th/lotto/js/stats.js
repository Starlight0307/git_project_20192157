/* =========================================================
   stats.js - 실제 당첨 번호 통계 (data.js의 LOTTO_DRAWS 사용)
   ---------------------------------------------------------
   1) 지난 회차(가장 최근) 당첨 번호 표시
   2) 번호별 출현 통계: 최근 1년 / 전체(1회~최근) 기간을 골라
      각 번호가 몇 회차에 나왔는지 퍼센트와 순위로 표시
   3) 회차별 당첨 번호 목록: 최신순, 회차 검색, 번호 포함 검색, 더 보기

   ※ 이 파일은 data.js(당첨 번호)와 lotto.js(createBall 함수)를 사용하므로
     lotto.html에서 두 파일보다 뒤에 불러와야 한다.
   ========================================================= */

// ---------------------------------------------------------
// 1. 설정값
// ---------------------------------------------------------
const PAGE_SIZE = 20;        // 회차 목록을 한 번에 몇 개씩 보여줄지
const ONE_YEAR_DAYS = 365;   // "최근 1년"의 기준 일수
const LATEST_ROUND = LOTTO_DRAWS.length; // 가장 최근 회차 번호 (= 데이터 개수)

// ---------------------------------------------------------
// 2. 화면 요소
// ---------------------------------------------------------
const latestTitleEl = document.getElementById("latestTitle");   // "1248회" 글자
const latestDateEl = document.getElementById("latestDate");     // 추첨일 글자
const latestBallsEl = document.getElementById("latestBalls");   // 지난 회차 공 7개 들어갈 곳
const rangeTabs = document.querySelectorAll(".range-tab");      // [최근 1년] [전체] 탭 버튼
const tabIndicator = document.getElementById("tabIndicator");   // 탭 아래에서 움직이는 배경
const bonusCheck = document.getElementById("bonusCheck");       // "보너스 번호 포함" 체크박스
const statsSummaryEl = document.getElementById("statsSummary"); // 기간·회차 수 요약 문구
const podiumEl = document.getElementById("podium");             // 1~3위 시상대
const statListEl = document.getElementById("statList");         // 45개 번호 순위 목록
const tipEl = document.getElementById("statTip");               // 마우스를 올리면 뜨는 설명 상자
const roundSearchEl = document.getElementById("roundSearch");   // 회차 검색 입력칸
const numberSearchEl = document.getElementById("numberSearch"); // 번호 포함 검색 입력칸
const drawListEl = document.getElementById("drawList");         // 회차별 목록
const drawInfoEl = document.getElementById("drawInfo");         // 목록 개수 안내 문구
const moreBtn = document.getElementById("moreBtn");             // [더 보기] 버튼

// ---------------------------------------------------------
// 3. 상태 변수
// ---------------------------------------------------------
let statsRange = "year";   // 통계 기간: "year"(최근 1년) 또는 "all"(전체)
let includeBonus = false;  // true면 보너스 번호도 출현 횟수에 포함
let shownCount = PAGE_SIZE; // 회차 목록에서 현재 보여주는 개수

// ---------------------------------------------------------
// 4. 도구 함수
// ---------------------------------------------------------

/** round회의 추첨일(Date)을 계산한다. 1회부터 7일씩 더함 */
function drawDate(round) {
  const d = new Date(LOTTO_FIRST_DATE + "T00:00:00");
  d.setDate(d.getDate() + (round - 1) * 7);
  return d;
}

/** 날짜를 "2026.10.31" 형태 글자로 바꾼다 */
function formatDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0"); // 한 자리 월 앞에 0 붙이기
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

/**
 * 숫자가 0부터 target까지 올라가는 애니메이션 (카운트업)
 * el: 숫자를 넣을 요소, decimals: 소수점 자리수, suffix: 뒤에 붙일 글자(예: "%")
 */
function countUp(el, target, decimals = 0, suffix = "", delay = 0) {
  const duration = 900; // 0.9초 동안
  setTimeout(() => {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1); // 진행률 0 → 1
      const eased = 1 - Math.pow(1 - p, 3);            // 처음엔 빠르고 끝에서 느려지는 곡선
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, delay);
}

// ---------------------------------------------------------
// 5. 지난 회차 당첨 번호
// ---------------------------------------------------------
function renderLatest() {
  const draw = LOTTO_DRAWS[LATEST_ROUND - 1]; // 마지막 줄 = 가장 최근 회차
  latestTitleEl.textContent = LATEST_ROUND + "회";
  latestDateEl.textContent = formatDate(drawDate(LATEST_ROUND)) + " 추첨";
  latestBallsEl.innerHTML = "";
  draw.forEach((n, i) => {
    if (i === 6) {
      // 6개 다음에 "+" 표시 후 보너스 공
      const plus = document.createElement("span");
      plus.className = "plus";
      plus.textContent = "+";
      latestBallsEl.appendChild(plus);
    }
    const ball = createBall(n);                 // lotto.js의 공 만들기 함수
    ball.classList.add("drop");
    ball.style.animationDelay = 0.9 + i * 0.12 + "s"; // 페이지가 열린 뒤 하나씩 차례로 떨어짐
    latestBallsEl.appendChild(ball);
  });
}

// ---------------------------------------------------------
// 6. 번호별 출현 통계
// ---------------------------------------------------------

/** 현재 선택된 기간에 해당하는 회차 번호 목록을 돌려준다 */
function getRangeRounds() {
  const rounds = [];
  if (statsRange === "all") {
    for (let r = 1; r <= LATEST_ROUND; r++) rounds.push(r);
  } else {
    // 최근 회차 추첨일로부터 365일 이내에 추첨한 회차만
    const limit = drawDate(LATEST_ROUND).getTime() - ONE_YEAR_DAYS * 24 * 60 * 60 * 1000;
    for (let r = LATEST_ROUND; r >= 1 && drawDate(r).getTime() > limit; r--) rounds.unshift(r);
  }
  return rounds;
}

/**
 * 회차 목록(rounds)에서 1~45번 각각의 출현 횟수와 퍼센트를 계산해 순위순으로 돌려준다.
 * 퍼센트 = (그 번호가 나온 회차 수) ÷ (전체 회차 수) × 100
 * 반환: [{ n: 번호, count: 출현 횟수, pct: 퍼센트, last: 마지막 출현 회차, rank: 순위 }, ...]
 */
function computeStats(rounds) {
  const counts = new Array(46).fill(0); // counts[번호] = 출현 횟수 (0번 칸은 사용 안 함)
  const last = new Array(46).fill(0);   // last[번호] = 마지막으로 나온 회차
  for (const r of rounds) {
    const draw = LOTTO_DRAWS[r - 1];
    const nums = includeBonus ? draw : draw.slice(0, 6); // 보너스 포함 여부에 따라 7개 또는 6개
    for (const n of nums) {
      counts[n]++;
      last[n] = r; // rounds가 오래된 순이라 마지막에 기록된 값이 가장 최근 회차
    }
  }

  const list = [];
  for (let n = 1; n <= 45; n++) {
    list.push({ n, count: counts[n], pct: (counts[n] / rounds.length) * 100, last: last[n] });
  }
  // 많이 나온 순으로 정렬, 횟수가 같으면 작은 번호가 앞
  list.sort((a, b) => b.count - a.count || a.n - b.n);
  // 순위 매기기: 횟수가 같으면 같은 순위 (예: 1위, 1위, 3위)
  list.forEach((item, i) => {
    item.rank = i > 0 && item.count === list[i - 1].count ? list[i - 1].rank : i + 1;
  });
  return list;
}

/** 통계 화면 전체(요약, 시상대, 순위 목록)를 다시 그린다 */
function renderStats() {
  const rounds = getRangeRounds();
  const stats = computeStats(rounds);
  const maxCount = stats[0].count; // 가장 많이 나온 횟수 (막대 길이 100% 기준)

  // 요약 문구
  statsSummaryEl.innerHTML =
    `기간 <b>${rounds[0]}회 ~ ${rounds[rounds.length - 1]}회</b> ` +
    `(${formatDate(drawDate(rounds[0]))} ~ ${formatDate(drawDate(rounds[rounds.length - 1]))}, 총 <b>${rounds.length}회</b> 추첨)` +
    `<br><small>퍼센트 = 해당 번호가 당첨 번호${includeBonus ? "(보너스 포함)" : ""}에 들어간 회차 ÷ 전체 회차</small>`;

  // ----- 1~3위 시상대 (2위 - 1위 - 3위 순서로 배치) -----
  podiumEl.innerHTML = "";
  [stats[1], stats[0], stats[2]].forEach((item, i) => {
    const place = [2, 1, 3][i];          // 시상대 자리 (가운데가 1등석)
    const div = document.createElement("div");
    div.className = "podium-item p" + place;
    div.style.animationDelay = [0.15, 0, 0.3][i] + "s";
    div.innerHTML = `<div class="medal">${["🥈", "🥇", "🥉"][i]}</div>`;
    const ballWrap = document.createElement("div");
    ballWrap.className = "podium-ball";
    ballWrap.appendChild(createBall(item.n));
    div.appendChild(ballWrap);
    div.insertAdjacentHTML("beforeend",
      `<div class="podium-pct">0%</div><div class="podium-count">${item.count}회 출현 · ${item.rank}위</div><div class="podium-step">${place}</div>`);
    podiumEl.appendChild(div);
    countUp(div.querySelector(".podium-pct"), item.pct, 1, "%", 300);
  });

  // ----- 45개 번호 순위 막대 -----
  statListEl.innerHTML = "";
  stats.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "stat-row";
    li.style.animationDelay = i * 0.025 + "s"; // 위에서부터 차례로 나타남
    li.innerHTML = `<span class="stat-rank">${item.rank}위</span>`;
    const ballWrap = document.createElement("span");
    ballWrap.className = "stat-ball";
    ballWrap.appendChild(createBall(item.n));
    li.appendChild(ballWrap);
    li.insertAdjacentHTML("beforeend",
      `<span class="bar-track"><span class="bar"></span></span>` +
      `<span class="stat-value"><b class="stat-pct">0.0%</b><small>${item.count}회</small></span>`);
    // 마우스를 올리면 보여줄 설명 (설명 상자에서 사용)
    li.dataset.tip =
      `<b>${item.n}번 · ${item.rank}위</b><br>${rounds.length}회 중 ${item.count}회 출현 (${item.pct.toFixed(1)}%)` +
      `<br>마지막 출현: ${item.last ? item.last + "회" : "기간 내 없음"}`;
    statListEl.appendChild(li);

    // 막대: 처음엔 길이 0 → 잠시 후 실제 길이로 늘어나는 애니메이션
    const bar = li.querySelector(".bar");
    setTimeout(() => (bar.style.width = (item.count / maxCount) * 100 + "%"), 50 + i * 25);
    countUp(li.querySelector(".stat-pct"), item.pct, 1, "%", i * 25);
  });
}

/** 탭 아래 배경(인디케이터)을 선택된 탭 위치로 미끄러지듯 이동 */
function moveIndicator() {
  const active = document.querySelector(".range-tab.active");
  tabIndicator.style.width = active.offsetWidth + "px";
  tabIndicator.style.transform = `translateX(${active.offsetLeft - 4}px)`; // 4px: 탭 묶음 안쪽 여백
}

// ----- 마우스를 올리면 뜨는 설명 상자 -----
statListEl.addEventListener("mousemove", (e) => {
  const row = e.target.closest(".stat-row");
  if (!row) return (tipEl.style.opacity = 0);
  tipEl.innerHTML = row.dataset.tip;
  tipEl.style.opacity = 1;
  // 마우스 오른쪽 아래에 표시, 화면 밖으로 나가지 않게 조정
  const x = Math.min(e.clientX + 16, window.innerWidth - tipEl.offsetWidth - 10);
  tipEl.style.transform = `translate(${x}px, ${e.clientY + 16}px)`;
});
statListEl.addEventListener("mouseleave", () => (tipEl.style.opacity = 0));

// ----- 탭과 체크박스 -----
rangeTabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    if (tab.dataset.range === statsRange) return; // 이미 선택된 탭이면 무시
    statsRange = tab.dataset.range;
    rangeTabs.forEach((t) => t.classList.toggle("active", t === tab));
    moveIndicator();
    renderStats();
  })
);
bonusCheck.addEventListener("change", () => {
  includeBonus = bonusCheck.checked;
  renderStats();
});
window.addEventListener("resize", moveIndicator); // 화면 크기가 바뀌면 인디케이터 위치 재계산

// ---------------------------------------------------------
// 7. 회차별 당첨 번호 목록
// ---------------------------------------------------------

/** 검색 조건에 맞는 회차 번호 목록을 최신순으로 돌려준다 */
function getFilteredRounds() {
  const round = Number(roundSearchEl.value);   // 회차 검색값 (비어 있으면 0)
  const number = Number(numberSearchEl.value); // 번호 포함 검색값 (비어 있으면 0)
  const result = [];
  for (let r = LATEST_ROUND; r >= 1; r--) {
    if (round && r !== round) continue;                              // 회차 검색: 그 회차만
    if (number && !LOTTO_DRAWS[r - 1].slice(0, 6).includes(number)) continue; // 번호 검색: 당첨 번호 6개에 포함된 회차만
    result.push(r);
  }
  return result;
}

/**
 * 회차 목록을 그린다.
 * append가 true면 [더 보기]로 늘어난 부분만 아래에 추가 (기존 목록은 그대로)
 */
function renderDraws(append = false) {
  const rounds = getFilteredRounds();
  const number = Number(numberSearchEl.value);
  const start = append ? drawListEl.children.length : 0; // 새로 그리기 시작할 위치
  if (!append) drawListEl.innerHTML = "";

  rounds.slice(start, shownCount).forEach((r, i) => {
    const draw = LOTTO_DRAWS[r - 1];
    const li = document.createElement("li");
    li.className = "draw-row";
    li.style.animationDelay = i * 0.03 + "s";
    li.innerHTML =
      `<span class="draw-round">${r}회</span><span class="draw-date">${formatDate(drawDate(r))}</span>`;
    const balls = document.createElement("div");
    balls.className = "mini-balls";
    draw.forEach((n, k) => {
      if (k === 6) balls.insertAdjacentHTML("beforeend", '<span class="plus">+</span>');
      const ball = createBall(n);
      if (number && n === number && k < 6) ball.classList.add("hit"); // 검색한 번호는 강조
      balls.appendChild(ball);
    });
    li.appendChild(balls);
    drawListEl.appendChild(li);
  });

  // 안내 문구와 [더 보기] 버튼
  const shown = Math.min(shownCount, rounds.length);
  drawInfoEl.textContent = rounds.length
    ? `총 ${rounds.length}개 회차 중 ${shown}개 표시`
    : "조건에 맞는 회차가 없습니다.";
  moreBtn.style.display = shown < rounds.length ? "" : "none";
  moreBtn.textContent = `더 보기 (${rounds.length - shown}개 남음)`;
}

// 검색칸에 입력할 때마다 처음부터 다시 보여줌
[roundSearchEl, numberSearchEl].forEach((input) =>
  input.addEventListener("input", () => {
    shownCount = PAGE_SIZE;
    renderDraws();
  })
);
// [더 보기]: PAGE_SIZE개 더 보여줌
moreBtn.addEventListener("click", () => {
  shownCount += PAGE_SIZE;
  renderDraws(true);
});

// ---------------------------------------------------------
// 8. 처음 화면 표시
// ---------------------------------------------------------
renderLatest();
renderDraws();
moveIndicator();

// 통계는 화면에 보일 때 처음 그려서, 막대가 늘어나는 애니메이션을 놓치지 않게 함
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    renderStats();
    statsObserver.disconnect(); // 한 번만 실행
  }
}, { threshold: 0.15 });
statsObserver.observe(document.querySelector(".stats-card"));
