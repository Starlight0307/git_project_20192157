package com.example.a10th_calc

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    lateinit var txtExpression: TextView  // 위쪽 작은 글자: 지금까지의 식
    lateinit var txtInput: TextView       // 아래쪽 큰 글자: 입력 중인 숫자 / 결과
    val calc = Calculator()               // 실제 계산은 Calculator가 담당

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 배경이 늘 어두우므로 상태 표시줄 아이콘(시계·배터리)을 밝은 색으로
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT)
        )
        setContentView(R.layout.activity_main)
        // 상태 표시줄·내비게이션 바에 화면이 가려지지 않게 여백을 줌
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        txtExpression = findViewById(R.id.txtExpression)
        txtInput = findViewById(R.id.txtInput)
        refresh()
    }

    // 모든 버튼이 android:onClick="onKey"로 이 함수를 부름 → 버튼 글자로 무엇을 할지 정함
    fun onKey(view: View) {
        when (val key = (view as Button).text.toString()) {
            "C" -> calc.clear()
            "⌫" -> calc.backspace()
            "%" -> calc.percent()
            "±" -> calc.negate()
            "." -> calc.dot()
            "=" -> calc.equals()
            "+", "−", "×", "÷" -> calc.operator(key)
            else -> calc.digit(key)  // 0~9
        }
        refresh()
    }

    // 계산기 상태를 화면 글자에 반영
    private fun refresh() {
        txtExpression.text = calc.expression
        txtInput.text = calc.input
    }
}
