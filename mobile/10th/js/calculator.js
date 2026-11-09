// 계산기 동작 코드 파일
const display = document.getElementById('display'); // 숫자를 보여줄 화면 칸을 가져온다
let firstNumber = null; // 연산 기호를 누르기 전에 입력한 첫 번째 숫자
let operator = null; // 사용자가 고른 연산 기호 (+, -, *, /)
let startNewNumber = true; // true면 다음 숫자 버튼이 화면을 새로 시작한다

// 숫자 버튼을 눌렀을 때: 화면에 숫자를 이어 붙인다
function pressNumber(digit) { // digit은 누른 숫자 글자('0'~'9')
  if (startNewNumber || display.textContent === '0') { // 새 숫자를 시작해야 하거나 화면이 0이면
    display.textContent = digit; // 화면을 누른 숫자로 바꾼다
  } else { // 이미 숫자를 입력하는 중이면
    display.textContent += digit; // 기존 숫자 뒤에 이어 붙인다
  } // 조건 끝
  startNewNumber = false; // 이제 숫자를 입력하는 중이라고 표시한다
} // pressNumber 끝

// 연산 기호 버튼을 눌렀을 때: 첫 번째 숫자와 기호를 기억한다
function pressOperator(selectedOperator) { // selectedOperator는 누른 기호
  if (operator !== null && !startNewNumber) pressEquals(); // 이전 계산이 남아 있으면 먼저 계산한다 (예: 1+2+ → 3)
  firstNumber = Number(display.textContent); // 화면의 숫자를 첫 번째 숫자로 저장한다
  operator = selectedOperator; // 누른 기호를 저장한다
  startNewNumber = true; // 다음 숫자는 새로 입력받는다
} // pressOperator 끝

// = 버튼을 눌렀을 때: 저장한 숫자와 화면 숫자로 계산한다
function pressEquals() { // 계산 함수 시작
  if (operator === null) return; // 고른 기호가 없으면 계산하지 않는다
  const secondNumber = Number(display.textContent); // 화면의 숫자를 두 번째 숫자로 쓴다
  let result; // 계산 결과를 담을 변수
  if (operator === '+') result = firstNumber + secondNumber; // 더하기
  if (operator === '-') result = firstNumber - secondNumber; // 빼기
  if (operator === '*') result = firstNumber * secondNumber; // 곱하기
  if (operator === '/') result = secondNumber === 0 ? '오류' : firstNumber / secondNumber; // 나누기 (0으로 나누면 '오류')
  display.textContent = result; // 결과를 화면에 보여준다
  operator = null; // 계산이 끝났으니 기호를 비운다
  startNewNumber = true; // 다음 숫자는 새로 입력받는다
} // pressEquals 끝

// C 버튼을 눌렀을 때: 모든 값을 처음 상태로 되돌린다
function pressClear() { // 초기화 함수 시작
  display.textContent = '0'; // 화면을 0으로 되돌린다
  firstNumber = null; // 첫 번째 숫자를 지운다
  operator = null; // 연산 기호를 지운다
  startNewNumber = true; // 새 숫자를 받을 준비를 한다
} // pressClear 끝
