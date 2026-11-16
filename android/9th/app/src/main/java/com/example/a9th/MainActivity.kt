package com.example.a9th

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    // 위젯 객체 변수 선언
    lateinit var etNum1: EditText
    lateinit var etNum2: EditText
    lateinit var btnSum: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // findViewById로 위젯 id를 가져온다
        etNum1 = findViewById(R.id.etNum1)
        etNum2 = findViewById(R.id.etNum2)
        btnSum = findViewById(R.id.btnSum)
    }

    // [두 수의 합은?] 버튼 — activity_main.xml의 android:onClick="onButtonClick"
    fun onButtonClick(view: View) {
        val num1 = etNum1.text.toString().trim().toIntOrNull()
        val num2 = etNum2.text.toString().trim().toIntOrNull()
        if (num1 == null || num2 == null) {
            Toast.makeText(this, R.string.sum_error, Toast.LENGTH_SHORT).show()
            return
        }
        Toast.makeText(this, getString(R.string.sum_result, num1, num2, num1 + num2), Toast.LENGTH_SHORT).show()
    }
}
