/* =========================================================
   machine.js - 로또 추첨기 애니메이션
   ---------------------------------------------------------
   유리 구슬 안에서 1~45번 공이 튀어 다니는 모습을 <canvas>에 그린다.
   다른 파일(lotto.js)에서는 아래 4가지 기능만 사용한다.
     LottoMachine.startMix()      : 바람을 불어 공을 세게 섞기 시작
     LottoMachine.stopMix()       : 섞기 멈춤 (공이 아래로 가라앉음)
     LottoMachine.removeBall(n)   : n번 공을 추첨기에서 꺼냄
     LottoMachine.refill()        : 꺼낸 공을 모두 다시 넣음
   ========================================================= */

const LottoMachine = (function () {
  // ----- 캔버스 준비 -----
  const canvas = document.getElementById("machineCanvas"); // 그림을 그릴 캔버스 요소
  const ctx = canvas.getContext("2d");                       // 캔버스에 그리는 "붓"
  const SIZE = 300;                                          // 캔버스 논리 크기 (가로=세로 300)
  const dpr = window.devicePixelRatio || 1;                  // 화면 픽셀 밀도 (선명하게 보이도록)
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  ctx.scale(dpr, dpr);

  // ----- 유리 구슬(용기) 정보 -----
  const CX = SIZE / 2;     // 구슬 중심 x
  const CY = SIZE / 2;     // 구슬 중심 y
  const RADIUS = 138;      // 구슬 안쪽 반지름
  const BALL_R = 12;       // 공 하나의 반지름
  const GRAVITY = 500;     // 아래로 끌어당기는 힘 (초당 속도 증가량)
  const MAX_SPEED = 550;   // 섞는 중 공의 최대 속력 (초당 픽셀)

  let balls = [];          // 추첨기 안에 있는 공 목록 { n: 번호, x, y: 위치, vx, vy: 속도 }
  let mixing = false;      // true면 바람을 불어 공을 세게 섞는 중
  let lastTime = 0;        // 직전 프레임 시각 (움직임 계산용)

  /**
   * 번호에 맞는 한국 로또 공 색상을 돌려준다.
   * 1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록
   */
  function ballColor(n) {
    if (n <= 10) return "#fbc400";
    if (n <= 20) return "#69c8f2";
    if (n <= 30) return "#ff7272";
    if (n <= 40) return "#aaaaaa";
    return "#b0d840";
  }

  /** a 이상 b 미만의 랜덤 실수 */
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  /** 1~45번 공을 모두 구슬 안 랜덤 위치에 다시 넣는다 */
  function refill() {
    balls = [];
    for (let n = 1; n <= 45; n++) {
      // 구슬 아래쪽 절반에 무작위로 배치
      const angle = rand(0, Math.PI);           // 0~180도 (아래쪽 반원)
      const dist = rand(0, RADIUS - BALL_R * 2); // 중심에서 떨어진 거리
      balls.push({
        n: n,
        x: CX + Math.cos(angle) * dist,
        y: CY + Math.sin(angle) * dist * 0.6,
        vx: rand(-50, 50),
        vy: rand(-50, 50),
      });
    }
  }

  /** n번 공을 추첨기에서 꺼낸다 (화면에서 사라짐) */
  function removeBall(n) {
    balls = balls.filter((b) => b.n !== n);
  }

  /** 공들의 위치·속도를 dt초만큼 계산한다 */
  function update(dt) {
    for (const b of balls) {
      // 1) 중력: 아래로 떨어짐
      b.vy += GRAVITY * dt;

      // 2) 섞는 중이면 바닥에서 바람이 불어 공이 구슬 안을 날아다님
      if (mixing) {
        // depth: 구슬 맨 위 0 ~ 맨 아래 1. 아래쪽 공일수록 위로 부는 바람을 세게 받음
        const depth = (b.y - (CY - RADIUS)) / (2 * RADIUS);
        b.vy -= 1400 * depth * dt;
        // 사방으로 무작위 흔들림을 더해 공이 이리저리 섞이게 함
        b.vx += rand(-2500, 2500) * dt;
        b.vy += rand(-2500, 2500) * dt;
        // 너무 빨라지지 않도록 속력을 최대 MAX_SPEED로 제한
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > MAX_SPEED) {
          b.vx *= MAX_SPEED / speed;
          b.vy *= MAX_SPEED / speed;
        }
      }

      // 3) 위치 이동
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // 4) 유리 벽과 충돌: 중심에서 너무 멀어지면 벽 안쪽으로 되돌리고 튕겨냄
      const dx = b.x - CX;
      const dy = b.y - CY;
      const dist = Math.hypot(dx, dy);
      const maxDist = RADIUS - BALL_R;
      if (dist > maxDist) {
        const nx = dx / dist; // 벽 방향 단위 벡터 (x)
        const ny = dy / dist; // 벽 방향 단위 벡터 (y)
        b.x = CX + nx * maxDist;
        b.y = CY + ny * maxDist;
        // 벽 방향 속도 성분을 반대로 뒤집고, 0.7배로 줄여 힘이 빠지게 함
        const dot = b.vx * nx + b.vy * ny;
        if (dot > 0) {
          b.vx -= 1.7 * dot * nx;
          b.vy -= 1.7 * dot * ny;
        }
      }
    }

    // 5) 공끼리 충돌: 겹치면 서로 밀어내고 속도를 주고받음
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const overlap = BALL_R * 2 - dist; // 겹친 길이
        if (overlap > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          // 겹친 만큼 반씩 밀어냄
          a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
          b.x += nx * overlap / 2; b.y += ny * overlap / 2;
          // 서로 다가오는 중이면 부딪힌 방향의 속도를 교환 (당구공처럼)
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            a.vx += rel * nx * 0.9; a.vy += rel * ny * 0.9;
            b.vx -= rel * nx * 0.9; b.vy -= rel * ny * 0.9;
          }
        }
      }
    }
  }

  /** 유리 구슬과 공들을 그린다 */
  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 구슬 안쪽 배경 (살짝 푸른 유리)
    const glass = ctx.createRadialGradient(CX - 40, CY - 50, 10, CX, CY, RADIUS + 10);
    glass.addColorStop(0, "rgba(255,255,255,0.18)");
    glass.addColorStop(1, "rgba(120,160,255,0.08)");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS + 6, 0, Math.PI * 2);
    ctx.fill();

    // 공 그리기
    for (const b of balls) {
      // 공 몸통: 왼쪽 위가 밝은 입체 그라데이션
      const g = ctx.createRadialGradient(b.x - 4, b.y - 4, 1, b.x, b.y, BALL_R);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, ballColor(b.n));
      g.addColorStop(1, ballColor(b.n));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      // 공 번호
      ctx.fillStyle = "#222";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.n, b.x, b.y + 0.5);
    }

    // 유리 테두리와 반사광 (공 위에 덮어 그려 유리처럼 보이게)
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS - 14, Math.PI * 1.1, Math.PI * 1.4); // 왼쪽 위 반짝이는 곡선
    ctx.stroke();
  }

  /** 매 프레임 반복: 계산 → 그리기 */
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30); // 프레임 간 시간 (최대 1/30초로 제한)
    lastTime = now;
    // 한 프레임을 4번에 나눠 계산하면 공끼리 덜 겹치고 자연스러움
    for (let i = 0; i < 4; i++) update(dt / 4);
    draw();
    requestAnimationFrame(loop);
  }

  // 처음 시작: 공 45개를 넣고 애니메이션 시작
  refill();
  requestAnimationFrame((t) => { lastTime = t; loop(t); });

  // 바깥(lotto.js)에서 쓸 수 있도록 공개하는 기능들
  return {
    startMix: () => { mixing = true; },
    stopMix: () => { mixing = false; },
    removeBall: removeBall,
    refill: refill,
  };
})();
