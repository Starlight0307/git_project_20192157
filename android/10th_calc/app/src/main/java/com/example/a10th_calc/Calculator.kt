package com.example.a10th_calc

import java.math.BigDecimal
import java.math.MathContext

// 화면과 상관없는 계산 규칙만 모아 둔 클래스 (단위 테스트로 따로 확인할 수 있게 분리)
// Double 대신 BigDecimal을 써서 0.1 + 0.2 가 0.30000000000000004 처럼 나오지 않게 함
class Calculator {
    var input = "0"          // 지금 입력 중인 숫자 (화면 아래 큰 글자)
        private set
    var expression = ""      // 지금까지의 식 (화면 위 작은 글자, 예: "12 +")
        private set

    private var stored: BigDecimal? = null  // 연산자 앞에 입력한 숫자
    private var op: String? = null          // 다음 숫자를 기다리는 연산자
    private var fresh = true                // true면 다음 숫자를 누를 때 input을 새로 시작

    // input이 숫자가 아니면 (0으로 나누기 오류 메시지) 오류 상태
    private val isError get() = input.toBigDecimalOrNull() == null

    fun digit(d: String) {
        if (fresh || input == "0") input = d
        else if (input.length < 15) input += d  // 화면을 넘지 않게 15자리까지만
        fresh = false
    }

    fun dot() {
        if (fresh || isError) input = "0."
        else if ('.' !in input) input += "."
        fresh = false
    }

    fun backspace() {
        if (isError) return clear()
        if (fresh) return  // 계산 결과는 지우지 않음
        input = input.dropLast(1)
        if (input.isEmpty() || input == "-") input = "0"
    }

    // 부호 바꾸기 (±)
    fun negate() {
        if (isError) return clear()
        if (input == "0") return
        input = if (input.startsWith("-")) input.drop(1) else "-$input"
    }

    fun percent() {
        if (isError) return clear()
        input = format(BigDecimal(input).divide(BigDecimal(100)))
        fresh = true
    }

    // 연산자는 누른 순서대로 계산 (2 + 3 × 4 = 20, 일반 계산기와 같은 방식)
    fun operator(o: String) {
        if (isError) clear()
        val a = stored
        val pending = op
        if (a != null && pending != null && !fresh) {
            // "12 + 3" 다음에 연산자를 누르면 앞부분을 먼저 계산
            val r = calc(a, pending, BigDecimal(input)) ?: return
            stored = r
            input = format(r)
        } else if (pending == null) {
            stored = BigDecimal(input)
        }
        // 연산자를 연달아 누르면 마지막 연산자로 바뀜
        op = o
        expression = "${format(stored!!)} $o"
        fresh = true
    }

    fun equals() {
        val a = stored ?: return
        val pending = op ?: return
        if (isError) return clear()
        val b = BigDecimal(input)
        val r = calc(a, pending, b) ?: return
        expression = "${format(a)} $pending ${format(b)} ="
        input = format(r)
        stored = null
        op = null
        fresh = true
    }

    fun clear() {
        input = "0"
        expression = ""
        stored = null
        op = null
        fresh = true
    }

    // 0으로 나누면 오류 메시지를 띄우고 null을 돌려줌
    private fun calc(a: BigDecimal, o: String, b: BigDecimal): BigDecimal? = when (o) {
        "+" -> a.add(b, MathContext.DECIMAL64)
        "−" -> a.subtract(b, MathContext.DECIMAL64)
        "×" -> a.multiply(b, MathContext.DECIMAL64)
        else -> if (b.signum() == 0) {
            clear()
            input = "0으로 나눌 수 없어요"
            null
        } else a.divide(b, MathContext.DECIMAL64)
    }

    // 15자리로 반올림하고 끝의 0을 지움 (3.50 → 3.5, 1E+2 → 100)
    private fun format(x: BigDecimal): String =
        x.round(MathContext(15)).stripTrailingZeros().toPlainString()
}
