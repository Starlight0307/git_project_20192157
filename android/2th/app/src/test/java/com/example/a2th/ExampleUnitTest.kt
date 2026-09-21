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
        val age : Int = 27
        // myName = "황휘"
        println("코틀린 : 불변 변수 val , 나의 이름은 : $myName 나의 나이는 : $age")
        var Long : Long = 25L

        var numOne = 1          // Int 형 추론
        var numTwo = 300000000  // Long 형 추론
        var myByte: Byte = 10   // 명시적 Byte형 지정
        var myInt: Int = 20     // 명시적 int형 지정

        println("No 1. : " +numOne)
        println("No 2. : " +numTwo)
        println("Byte : " +myByte)
        println("Int : " +myInt)

        var myFloat : Float = 30.2F     // 명시적 Float형 추론
        var myDouble : Double = 35.4     // 명시적 Double형 추론

        println("코틀린 : 실수 자료형 Float : " +myFloat)
        println("코틀린 : 실수 자료형 Double : " +myDouble)

        var myBoolean : Boolean = true  // 명시적 Boolean형 지정

        println("코틀린 : Boolean 자료형 : " +myBoolean)

        var myChar1 : Char = 'K'    // 변수 myChar1에 문자 값 'K'를 저장
        var myChar2 : Char = 'o'    // 변수 myChar2에 문자 값 'o'를 저장
        var myChar3 : Char = 't'    // 변수 myChar3에 문자 값 't'를 저장
        var myChar4 : Char = 'l'    // 변수 myChar4에 문자 값 'l'를 저장
        var myChar5 : Char = 'i'    // 변수 myChar5에 문자 값 'i'를 저장
        var myChar6 : Char = 'n'    // 변수 myChar6에 문자 값 'n'를 저장

        println("코틀린 : 문자 자료형 : " +myChar1+myChar2+myChar3+myChar4+myChar5+myChar6)

        var myString1 : String = "Kotlin\n"    // 명시적 String형 지정
        var myString2 : String = "Java"        // 명시적 String형 지정

        println("코틀린 : 문자열 자료형 String : " +myString1)
        println("코틀린 : 문자열 자료형 String : " +myString2)

        var myArray : IntArray = intArrayOf(1,2,3,4,5)  // 배열 myArray에 1,2,3,4,5 저장

        println("코틀린 : 배열 자료형 배열의 3번째 값 :  " +myArray[2])


    }
}