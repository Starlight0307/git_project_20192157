package com.example.a10th

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {

    lateinit var editName : EditText    // 이름
    lateinit var editPassword : EditText    // 비밀번호
    lateinit var editEmail : EditText   // 이메일
    lateinit var editBirth : EditText   // 생일
    lateinit var editPhone : EditText   // 연락처
    lateinit var txtResult : TextView   // 결과



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        editName = findViewById(R.id.editName)
        editPassword = findViewById(R.id.editPassword)
        editEmail = findViewById(R.id.editEmail)
        editBirth = findViewById(R.id.editBirth)
        editPhone = findViewById(R.id.editPhone)
        txtResult = findViewById(R.id.txtResult)

        findViewById<Button>(R.id.btnResult).setOnClickListener {
            if(editName.text.toString().isEmpty() || editPassword.text.toString().isEmpty() || editEmail.text.toString().isEmpty() || editBirth.text.toString().isEmpty() || editPhone.text.toString().isEmpty())
                else {
            txtResult.text = "성명: ${editName.text}\n" +
                    "비밀번호: ${editPassword.text}\n" +
                    "이메일: ${editEmail.text}\n" +
                    "생년월일: ${editBirth.text}\n" +
                    "연락처: ${editPhone.text}" }
        }
    }
}