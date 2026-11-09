package com.example.a10th_calc

import org.junit.Assert.assertEquals
import org.junit.Test

// Calculator 계산 규칙 확인 (버튼을 누르는 순서대로 함수를 부름)
class CalculatorTest {
    private fun press(vararg keys: String): Calculator {
        val c = Calculator()
        for (k in keys) when (k) {
            "C" -> c.clear(); "⌫" -> c.backspace(); "%" -> c.percent(); "±" -> c.negate()
            "." -> c.dot(); "=" -> c.equals()
            "+", "−", "×", "÷" -> c.operator(k)
            else -> c.digit(k)
        }
        return c
    }

    @Test fun decimalsAreExact() = assertEquals("0.3", press("0", ".", "1", "+", "0", ".", "2", "=").input)
    @Test fun leftToRight() = assertEquals("20", press("2", "+", "3", "×", "4", "=").input)
    @Test fun division() = assertEquals("0.333333333333333", press("1", "÷", "3", "=").input)
    @Test fun divideByZero() = assertEquals("0으로 나눌 수 없어요", press("5", "÷", "0", "=").input)
    @Test fun afterErrorDigitStartsOver() = assertEquals("7", press("5", "÷", "0", "=", "7").input)
    @Test fun backspace() = assertEquals("12", press("1", "2", "3", "⌫").input)
    @Test fun percentAndNegate() = assertEquals("-0.5", press("5", "0", "%", "±").input)
    @Test fun changeOperator() = assertEquals("2", press("6", "+", "−", "4", "=").input)
    @Test fun chainAfterEquals() = assertEquals("10", press("2", "+", "3", "=", "×", "2", "=").input)
    @Test fun expressionLine() = assertEquals("2 + 3 =", press("2", "+", "3", "=").expression)
}
