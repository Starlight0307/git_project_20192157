/* =========================================================
   effects.js - 꾸미기 효과 (게임 규칙과는 상관없는 시각 효과만 담당)
   ---------------------------------------------------------
   1) 배경에 떠오르는 흐릿한 로또 공
   2) 버튼 클릭 시 퍼지는 물결(ripple)
   3) 추첨 완료 시 터지는 꽃가루 → Effects.confetti() 로 실행
   ========================================================= */

const Effects = (function () {
  // ---------------------------------------------------------
  // 1. 배경에 떠오르는 공 만들기
  // ---------------------------------------------------------
  const BALL_COLORS = ["#fbc400", "#69c8f2", "#ff7272", "#aaaaaa", "#b0d840"]; // 로또 공 5가지 색
  const FLOAT_COUNT = window.innerWidth < 600 ? 10 : 18; // 떠다니는 공 개수 (휴대폰에서는 적게)
  const floating = document.getElementById("floating");  // 공을 넣을 배경 상자

  for (let i = 0; i < FLOAT_COUNT; i++) {
    const ball = document.createElement("span");
    const size = 24 + Math.random() * 46;                 // 공 크기 24~70px
    const n = Math.floor(Math.random() * 45) + 1;         // 공에 쓸 번호 1~45
    ball.textContent = n;
    ball.style.width = ball.style.height = size + "px";
    ball.style.fontSize = size * 0.38 + "px";
    ball.style.left = Math.random() * 100 + "vw";         // 가로 위치 랜덤
    ball.style.background = BALL_COLORS[Math.ceil(n / 10) - 1];
    ball.style.animationDuration = 18 + Math.random() * 20 + "s"; // 올라가는 속도 랜덤 (18~38초)
    ball.style.animationDelay = -Math.random() * 38 + "s";        // 음수 딜레이: 처음부터 화면 곳곳에 퍼져 있게
    floating.appendChild(ball);
  }

  // ---------------------------------------------------------
  // 2. 버튼 물결 효과: 페이지의 모든 .btn 클릭 시 클릭 지점에서 원이 퍼짐
  // ---------------------------------------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn"); // 클릭한 곳이 버튼(또는 버튼 안쪽)인지 확인
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height); // 물결 크기 = 버튼의 긴 변
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px"; // 클릭한 지점이 원의 중심이 되도록
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600); // 애니메이션이 끝나면 삭제
  });

  // ---------------------------------------------------------
  // 3. 꽃가루 효과 (캔버스에 그림)
  // ---------------------------------------------------------
  const canvas = document.getElementById("confetti"); // 화면 전체를 덮는 꽃가루 캔버스
  const ctx = canvas.getContext("2d");
  let pieces = [];       // 화면에 있는 꽃가루 조각들
  let running = false;   // 애니메이션이 돌고 있는지

  /** 캔버스 크기를 브라우저 창 크기에 맞춤 (창 크기가 바뀔 때마다 실행) */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  /**
   * 꽃가루를 터뜨린다. 화면 아래 양쪽 모서리에서 위로 쏘아 올림.
   * count: 조각 개수 (기본 160개)
   */
  function confetti(count = 160) {
    const colors = [...BALL_COLORS, "#ffffff", "#c084fc"];
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;                          // 짝수는 왼쪽, 홀수는 오른쪽에서 발사
      const angle = (fromLeft ? -60 : -120) + (Math.random() - 0.5) * 40; // 발사 각도 (도)
      const speed = 9 + Math.random() * 10;                  // 발사 속도
      const rad = (angle * Math.PI) / 180;                   // 도 → 라디안 변환
      pieces.push({
        x: fromLeft ? 0 : canvas.width,       // 시작 위치 x
        y: canvas.height,                     // 시작 위치 y (화면 맨 아래)
        vx: Math.cos(rad) * speed,            // 가로 속도
        vy: Math.sin(rad) * speed * 1.4,      // 세로 속도 (위로)
        w: 6 + Math.random() * 6,             // 조각 너비
        h: 8 + Math.random() * 8,             // 조각 높이
        rot: Math.random() * Math.PI,         // 현재 회전 각도
        vr: (Math.random() - 0.5) * 0.3,      // 회전 속도
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,                              // 남은 수명 (1 → 0이 되면 사라짐)
      });
    }
    if (!running) { running = true; requestAnimationFrame(animate); }
  }

  /** 꽃가루를 한 프레임 움직이고 그린다 */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.vy += 0.25;           // 중력
      p.vx *= 0.99;           // 공기 저항
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.006;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.rot * 3)); // 세로로 뒤집히며 팔랑거리는 효과
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    // 수명이 다했거나 화면 아래로 떨어진 조각 제거
    pieces = pieces.filter((p) => p.life > 0 && p.y < canvas.height + 40);
    if (pieces.length) requestAnimationFrame(animate);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  // 바깥(lotto.js)에서 쓸 수 있도록 공개하는 기능
  return { confetti };
})();
