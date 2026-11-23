// =============================================================
// login.js : 로그인 화면 동작 (입력 확인, 비밀번호 보이기, 아이디 저장, 모션)
// 순서: ① 기본 설정 → ② 입력 확인 → ③ 로그인 처리 → ④ 편의 기능 → ⑤ 모션 → ⑥ 시작
// =============================================================

// ===== ① 기본 설정 =====

// 체험용 계정 (서버가 없어서 이 계정만 로그인 성공으로 처리)
// shortcut: 화면 코드 안에서 계정을 비교함, 실제 서비스에서는 서버에 보내 확인하고 이 값은 지울 것
const DEMO_ACCOUNT = { email: 'demo@example.com', password: 'demo1234', name: '체험 사용자' };

// 아이디 저장에 쓰는 브라우저 저장소 이름 (비밀번호는 절대 저장하지 않음)
const REMEMBER_KEY = 'homepage-remembered-email';

// 사용자가 "움직임 줄이기"를 켜 두었는지 확인
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 화면에서 자주 쓰는 요소들을 미리 찾아 둠
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const rememberCheckbox = document.getElementById('rememberCheckbox');
const loginButton = document.getElementById('loginButton');
const formMessage = document.getElementById('formMessage');
const loginCard = document.getElementById('loginCard');
const successCard = document.getElementById('successCard');

// ===== ② 입력 확인 =====

// 이메일 입력값을 확인해서 문제가 있으면 안내 문구를, 없으면 빈 문자열을 돌려주는 함수
function validateEmail(email) {
  // 아무것도 안 썼으면
  if (email === '') return '이메일을 입력해 주세요.';
  // "글자@글자.글자" 모양이 아니면
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '이메일 형식이 올바르지 않아요. (예: name@example.com)';
  // 문제 없음
  return '';
}

// 비밀번호 입력값을 확인하는 함수
function validatePassword(password) {
  // 아무것도 안 썼으면
  if (password === '') return '비밀번호를 입력해 주세요.';
  // 8자보다 짧으면
  if (password.length < 8) return '비밀번호는 8자 이상이에요.';
  // 문제 없음
  return '';
}

// 입력칸 아래에 안내 문구를 보여주거나 지우는 함수
function showFieldError(input, message) {
  // 이 입력칸의 안내 문구 자리 찾기 (예: emailInput → emailError)
  const errorText = document.getElementById(input.id.replace('Input', 'Error'));
  // 안내 문구 넣기
  errorText.textContent = message;
  // 스크린리더에 "잘못된 입력"이라고 알림 + CSS가 빨간 테두리를 그림
  input.setAttribute('aria-invalid', String(message !== ''));
}

// 입력칸 하나를 확인하고 결과를 화면에 반영하는 함수 (문제가 없으면 true)
function checkField(input) {
  // 이메일/비밀번호에 맞는 확인 함수 실행 (이메일은 앞뒤 공백 제거)
  const message = input === emailInput ? validateEmail(input.value.trim()) : validatePassword(input.value);
  // 결과 표시
  showFieldError(input, message);
  // 문제가 없으면 true
  return message === '';
}

// ===== ③ 로그인 처리 =====

// 로그인 버튼(폼 제출)을 눌렀을 때 실행되는 함수
async function handleLoginSubmit(event) {
  // 폼 제출로 페이지가 새로고침되지 않도록 막음
  event.preventDefault();
  // 이전 결과 안내 지우기
  formMessage.textContent = '';
  // 두 입력칸을 모두 확인 (하나가 틀려도 둘 다 안내가 보이도록 각각 실행)
  const isEmailValid = checkField(emailInput);
  const isPasswordValid = checkField(passwordInput);
  // 하나라도 틀렸으면 카드를 흔들고, 첫 번째 틀린 칸으로 커서 이동
  if (!isEmailValid || !isPasswordValid) {
    shakeCard();
    (isEmailValid ? passwordInput : emailInput).focus();
    return;
  }
  // 로딩 표시 시작 (버튼을 잠가 두 번 눌리지 않게 함)
  setLoading(true);
  // 서버에 보내는 것처럼 잠깐 기다림
  await new Promise(resolve => setTimeout(resolve, 900));
  // 로딩 표시 끝
  setLoading(false);
  // 체험용 계정과 비교 (이메일은 대소문자 구분 없이)
  const isCorrect = emailInput.value.trim().toLowerCase() === DEMO_ACCOUNT.email && passwordInput.value === DEMO_ACCOUNT.password;
  // 틀렸으면: 어느 쪽이 틀렸는지는 알려주지 않음 (계정 존재 여부가 드러나지 않게)
  if (!isCorrect) {
    formMessage.textContent = '이메일 또는 비밀번호가 맞지 않아요.';
    shakeCard();
    passwordInput.select();
    return;
  }
  // 맞았으면: 아이디 저장 설정 반영 후 성공 화면으로
  saveRememberedEmail(rememberCheckbox.checked ? emailInput.value.trim() : '');
  showSuccess(DEMO_ACCOUNT.name);
}

// 로그인 버튼의 로딩 상태를 켜고 끄는 함수
function setLoading(isLoading) {
  // 로딩 중에는 버튼 잠금
  loginButton.disabled = isLoading;
  // CSS가 글자 대신 빙글 도는 표시를 보여줌
  loginButton.classList.toggle('is-loading', isLoading);
  // 스크린리더용 상태
  loginButton.setAttribute('aria-busy', String(isLoading));
}

// 로그인 성공 화면을 보여주는 함수
function showSuccess(name) {
  // 환영 문구에 이름 넣기
  document.getElementById('welcomeTitle').textContent = `${name}님, 환영해요!`;
  // 로그인 카드 숨기고 성공 카드 보이기
  loginCard.hidden = true;
  successCard.hidden = false;
  // 비밀번호 입력값 지우기 (화면에 남지 않게)
  passwordInput.value = '';
  // 키보드 사용자를 위해 로그아웃 버튼으로 이동
  document.getElementById('logoutButton').focus();
}

// 로그아웃: 처음 로그인 화면으로 돌아가는 함수
function logout() {
  // 성공 카드 숨기고 로그인 카드 보이기
  successCard.hidden = true;
  loginCard.hidden = false;
  // 저장된 이메일 다시 채우기 (저장 안 했으면 빈칸)
  emailInput.value = loadRememberedEmail();
  // 알림 표시
  showToast('로그아웃했어요.');
  // 비어 있는 칸으로 커서 이동
  (emailInput.value ? passwordInput : emailInput).focus();
}

// ===== ④ 편의 기능 =====

// 비밀번호 보이기/숨기기 버튼 동작
function togglePasswordVisibility() {
  // 지금 숨겨져 있는지 확인
  const isHidden = passwordInput.type === 'password';
  // 보이기 ↔ 숨기기 전환
  passwordInput.type = isHidden ? 'text' : 'password';
  // 버튼 아이콘과 이름 바꾸기
  const button = document.getElementById('togglePasswordButton');
  button.textContent = isHidden ? '🙈' : '👁️';
  button.setAttribute('aria-label', isHidden ? '비밀번호 숨기기' : '비밀번호 보이기');
  button.setAttribute('aria-pressed', String(isHidden));
}

// Caps Lock 이 켜져 있으면 안내를 보여주는 함수 (키를 누를 때마다 확인)
function updateCapsLockNotice(event) {
  // 키보드 이벤트가 아니면(자동완성 등) 무시
  if (!event.getModifierState) return;
  // Caps Lock 상태에 따라 안내 보이기/숨기기
  document.getElementById('capsLockNotice').hidden = !event.getModifierState('CapsLock');
}

// 저장해 둔 이메일 불러오기 (브라우저 저장소를 못 쓰는 환경이면 빈 문자열)
function loadRememberedEmail() {
  try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; }
}

// 이메일 저장하기 (빈 문자열이면 저장된 것을 지움)
function saveRememberedEmail(email) {
  try { email ? localStorage.setItem(REMEMBER_KEY, email) : localStorage.removeItem(REMEMBER_KEY); } catch { /* 저장소를 못 써도 로그인은 계속 */ }
}

// 체험용 계정을 입력칸에 채워 주는 함수 (한 글자씩 타이핑되는 효과)
async function fillDemoAccount() {
  // 이전 안내 지우기
  formMessage.textContent = '';
  // 이메일과 비밀번호를 차례로 타이핑
  for (const [input, text] of [[emailInput, DEMO_ACCOUNT.email], [passwordInput, DEMO_ACCOUNT.password]]) {
    // 칸 비우기
    input.value = '';
    // 한 글자씩 추가 (움직임 줄이기면 한 번에)
    for (const char of text) {
      input.value += char;
      if (!PREFERS_REDUCED_MOTION) await new Promise(resolve => setTimeout(resolve, 25));
    }
    // 채운 칸의 안내 문구 정리
    checkField(input);
  }
  // 로그인 버튼으로 커서 이동
  loginButton.focus();
}

// 화면 아래에 알림을 잠깐 띄우는 함수
function showToast(message) {
  // 알림 요소 찾기
  const toast = document.getElementById('toast');
  // 문구 넣고 보이기
  toast.textContent = message;
  toast.classList.add('is-visible');
  // 이전에 걸어 둔 숨기기 예약 취소 후 2.5초 뒤 숨기기
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

// ===== ⑤ 모션 효과 =====

// 로그인 카드를 좌우로 흔드는 함수 (입력이 틀렸을 때)
function shakeCard() {
  // 애니메이션을 처음부터 다시 실행하려고 클래스를 뗐다가 붙임
  loginCard.classList.remove('is-shaking');
  // 브라우저가 변화를 알아채도록 크기를 한 번 읽음
  void loginCard.offsetWidth;
  // 흔들기 시작
  loginCard.classList.add('is-shaking');
}

// 버튼을 누른 자리에서 물결이 퍼지는 효과
function createRipple(event) {
  // 버튼 크기·위치
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  // 물결 요소 만들기
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  // 누른 위치를 중심으로 배치 (키보드로 누르면 버튼 가운데)
  ripple.style.left = `${(event.clientX || rect.left + rect.width / 2) - rect.left}px`;
  ripple.style.top = `${(event.clientY || rect.top + rect.height / 2) - rect.top}px`;
  // 버튼에 넣고, 애니메이션이 끝나면 지움
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// 왼쪽 그림 영역에 흐르는 색 카드들을 채우는 함수 (장식용)
function fillCardWall() {
  // 3줄을 만들고, 줄마다 색이 다르게 시작함 (끊김 없이 흐르도록 같은 내용을 두 번 넣음)
  document.getElementById('cardWall').innerHTML = [0, 1, 2].map(column => {
    // 이 줄에 들어갈 카드 6장 (카드마다 다른 색상값)
    const cards = Array.from({ length: 6 }, (_, index) => `<div class="wall-card" style="--hue:${(column * 70 + index * 45) % 360}"></div>`).join('');
    // 줄 HTML (가운데 줄은 반대 방향으로 흐름)
    return `<div class="wall-column ${column % 2 ? 'is-reverse' : ''}">${cards}${cards}</div>`;
  }).join('');
}

// ===== ⑥ 시작: 페이지가 준비되면 모든 기능 연결 =====

// 화면 기능을 한꺼번에 연결하는 시작 함수
function startLoginPage() {
  // 장식 색 카드 채우기
  fillCardWall();
  // 저장된 이메일이 있으면 채우고 체크박스 켜기
  emailInput.value = loadRememberedEmail();
  rememberCheckbox.checked = emailInput.value !== '';

  // 폼 제출 = 로그인 시도
  loginForm.addEventListener('submit', handleLoginSubmit);
  // 입력칸에서 벗어날 때 확인 (아무것도 안 썼으면 아직 안내하지 않음)
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('blur', () => { if (input.value) checkField(input); });
    // 이미 안내가 떠 있으면 고치는 동안 바로바로 다시 확인
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') checkField(input); formMessage.textContent = ''; });
  });
  // 비밀번호 칸에서 키를 누를 때마다 Caps Lock 확인
  passwordInput.addEventListener('keydown', updateCapsLockNotice);
  passwordInput.addEventListener('keyup', updateCapsLockNotice);
  // 비밀번호 칸을 벗어나면 Caps Lock 안내 숨김
  passwordInput.addEventListener('blur', () => { document.getElementById('capsLockNotice').hidden = true; });

  // 버튼 연결
  document.getElementById('togglePasswordButton').addEventListener('click', togglePasswordVisibility);
  document.getElementById('fillDemoButton').addEventListener('click', fillDemoAccount);
  document.getElementById('logoutButton').addEventListener('click', logout);
  // 서버가 없는 기능은 안내만
  document.getElementById('findPasswordButton').addEventListener('click', () => showToast('연습용 화면이라 비밀번호 찾기는 준비 중이에요.'));
  document.getElementById('signupButton').addEventListener('click', () => showToast('연습용 화면이라 회원가입은 준비 중이에요.'));
  // 큰 버튼들에 물결 효과
  document.querySelectorAll('.login-button').forEach(button => button.addEventListener('click', createRipple));
  // 흔들기가 끝나면 클래스 정리 (카드 안 다른 요소의 애니메이션 끝 신호는 무시)
  loginCard.addEventListener('animationend', event => { if (event.target === loginCard) loginCard.classList.remove('is-shaking'); });

  // 이메일이 채워져 있으면 비밀번호 칸, 아니면 이메일 칸에 커서
  (emailInput.value ? passwordInput : emailInput).focus();
}

// HTML이 모두 준비되면 시작 함수 실행
document.addEventListener('DOMContentLoaded', startLoginPage);
