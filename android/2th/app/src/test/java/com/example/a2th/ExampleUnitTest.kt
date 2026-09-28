package com.example.a2th

import org.junit.Test

import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)

        val myName = "황휘"
        val age: Int = 27
        // myName = "황휘"
        println("코틀린 : 불변 변수 val , 나의 이름은 : $myName 나의 나이는 : $age")
        var Long: Long = 25L

        var numOne = 1          // Int 형 추론
        var numTwo = 300000000  // Long 형 추론
        var myByte: Byte = 10   // 명시적 Byte형 지정
        var myInt: Int = 20     // 명시적 int형 지정

        println("No 1. : " + numOne)
        println("No 2. : " + numTwo)
        println("Byte : " + myByte)
        println("Int : " + myInt)

        var myFloat: Float = 30.2F     // 명시적 Float형 추론
        var myDouble: Double = 35.4     // 명시적 Double형 추론

        println("코틀린 : 실수 자료형 Float : " + myFloat)
        println("코틀린 : 실수 자료형 Double : " + myDouble)

        var myBoolean: Boolean = true  // 명시적 Boolean형 지정

        println("코틀린 : Boolean 자료형 : " + myBoolean)

        var myChar1: Char = 'K'    // 변수 myChar1에 문자 값 'K'를 저장
        var myChar2: Char = 'o'    // 변수 myChar2에 문자 값 'o'를 저장
        var myChar3: Char = 't'    // 변수 myChar3에 문자 값 't'를 저장
        var myChar4: Char = 'l'    // 변수 myChar4에 문자 값 'l'를 저장
        var myChar5: Char = 'i'    // 변수 myChar5에 문자 값 'i'를 저장
        var myChar6: Char = 'n'    // 변수 myChar6에 문자 값 'n'를 저장

        println("코틀린 : 문자 자료형 : " + myChar1 + myChar2 + myChar3 + myChar4 + myChar5 + myChar6)

        var myString1: String = "Kotlin\n"    // 명시적 String형 지정
        var myString2: String = "Java"        // 명시적 String형 지정

        println("코틀린 : 문자열 자료형 String : " + myString1)
        println("코틀린 : 문자열 자료형 String : " + myString2)

        var myArray: IntArray = intArrayOf(1, 2, 3, 4, 5)  // 배열 myArray에 1,2,3,4,5 저장

        println("코틀린 : 배열 자료형 배열의 3번째 값 :  " + myArray[2])

        var myX: Int = 100
        var myY: Float = myX.toFloat()     //오류발생

        println("코틀린 : 자료형 변환 : Int : " + myX)
        println("코틀린 : 자료형 변환 : Float : " + myY)

        var x: Int = 5
        var y: Int = 2

        println("코틀린 : 산술 연산자 X + Y = " + (x + y))
        println("코틀린 : 산술 연산자 X - Y = " + (x - y))
        println("코틀린 : 산술 연산자 X / Y = " + (x / y))
        println("코틀린 : 산술 연산자 X * Y = " + (x * y))
        println("코틀린 : 산술 연산자 X % Y = " + (x % y))

        println("코틀린 : 비교 연산자 X > Y : " + (x > y))
        println("코틀린 : 비교 연산자 X < Y : " + (x < y))
        println("코틀린 : 비교 연산자 X >= Y : " + (x >= y))
        println("코틀린 : 비교 연산자 X <= Y : " + (x <= y))
        println("코틀린 : 비교 연산자 X == Y : " + (x == y))
        println("코틀린 : 비교 연산자 X != Y : " + (x != y))

        var X: Int = 5
        var Y: Int = 10

        Y += X
        println("코틀린 : 할당 연산자 Y += X => Y : " + Y)
        Y -= X
        println("코틀린 : 할당 연산자 Y += X => Y : " + Y)
        Y *= X
        println("코틀린 : 할당 연산자 Y *= X => Y : " + Y)
        Y /= X
        println("코틀린 : 할당 연산자 Y /= X => Y : " + Y)
        Y %= X
        println("코틀린 : 할당 연산자 Y %= X => Y : " + Y)

        var z: Int = 1

        println("코틀린 : 증감 연산자 ++z : " + ++z)
        println("코틀린 : 증감 연산자 --z : " + --z)

        var num: Int = 3
        if (num > 0) {
            println("코틀린 : if 조건문 숫자 " + num + "은 양수")
        }

        var num2: Int = 10
        if (num2 % 2 == 0) {
            println("코틀린 : if-else 조건문 숫자 " + num2 + "은 짝수")
        } else {
            println("코틀린 : if-else 조건문 숫자 " + num2 + "은 홀수")
        }

        var num3: Int = -10
        var result: String
        if (num3 > 0) {
            result = "숫자 " + num3 + "은 양수"
        } else if (num == 0) {
            result = "숫자 " + num3 + "은 0"
        } else {
            result = "숫자 " + num3 + "은 음수"
        }
        println("코틀린 : if-else-if 조건문 " + result)


        var num4: Int = 10
        var result2: String
        if (num4 > 0) {
            if (num4 % 2 == 0) {
                result2 = "숫자 " + num4 + "은 양수이고 짝수입니다."
            } else {
                result2 = "숫자 " + num4 + "은 양수이지만 홀수입니다."
            }
        } else {
            if (num4 % 2 == 0) {
                result2 = "숫자 " + num4 + "은 음수이고 짝수입니다."
            } else {
                result2 = "숫자 " + num4 + "은 음수이지만 홀수입니다."
            }

        }
        println("코틀린 : 중첩 if 조건문 " + result2)

        if (num4 % 2 == 0) {
            result2 = "숫자 " + num4 + "은 짝수입니다."
        } else {
            result2 = "숫자 " + num4 + "은 홀수입니다."
        }
        println("코틀린 : 중첩 if 조건문 " + result2)

        var day : Int = 2
        var result3 : String
        when (day) {
            1 -> result3 = "Monday"
            2 -> result3 = "Tuesday"
            3 -> result3 = "Wednesday"
            4 -> result3 = "Thursday"
            5 -> result3 = "Friday"
            6 -> result3 = "Saturday"
            7 -> result3 = "Sunday"
            else -> result3 = "Invalid day."
        }
        println("코틀린 : when 조건문 " + result3)

        for ( i in 5 downTo 1) {
            println("코틀린 : for 반복문 반복 변수 : " + i)
        }

        for ( i in 5 downTo 1 step 2 ) {
            println("코틀린 : for 반복문 반복 변수 : " + i)
        }

        var numbers = arrayOf(1, 2, 3, 4, 5)
        for ( i in numbers){    //i in [1, 2, 3, 4, 5]와 같은 의미
            if(i % 2 == 1 ){
                println("코틀린 : for 반복문 반복 변수 : " + i)
            }

        }
        val score : Int = 96
        val attendanceRate : Int = 85

        // 학점 계산 함수 호출
        val result4 = calculateGrade(score, attendanceRate)

        // 계산된 결과를 println으로 출력 (Logcat의 System.out에서 확인 가능)
        println("점수: $score, 출석률: $attendanceRate% -> 결과: $result4")
    }

    /**
     * 다중 조건문과 논리 연산자를 활용하여 학점을 계산하는 함수
     */
    private fun calculateGrade(score: Int, attendanceRate: Int): String {
        // 1차 조건: 출석률이 80 미만이면 점수와 상관없이 무조건 F 학점
        if (attendanceRate < 80) {
            return "F 학점"
        }

        // 2차 조건: 출석률이 80 이상인 경우 점수에 따라 학점 판별
        if (score >= 90) {
            // 90점 이상이면서 95점 이상인지 중첩 조건문으로 확인
            if (score >= 95) {
                return "A 학점 (A+ 장학생 선발대상)"
            } else {
                return "A 학점"
            }
        } else if (score >= 80 && score < 90) {
            return "B 학점"
        } else if (score >= 70 && score < 80) {
            return "C 학점"
        } else {
            return "F 학점"
        }
    }

    }