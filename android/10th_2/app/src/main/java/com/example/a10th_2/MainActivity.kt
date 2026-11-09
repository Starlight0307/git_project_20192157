package com.example.a10th_2

import android.os.Bundle
import android.renderscript.BaseObj
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    lateinit var imageView: ImageView // 이미지 뷰어 객체 변수
    lateinit var ImgButton: Button  // 버튼 객체 변수
    lateinit var numObj : TextView    // 이미지 이름


    var index = 0

    var imgNumber = arrayOf(R.drawable.img1, R.drawable.img2, R.drawable.img3, R.drawable.img4, R.drawable.img5)



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        numObj = findViewById(R.id.textView)
        imageView = findViewById(R.id.imageView)
    }

    // 레이아웃 android:onClick이 찾을 수 있게 클래스 멤버로 둠
    fun onButtonClick(view: View) {
        index = (index + 1) % imgNumber.size
        imageView.setImageResource(imgNumber[index])
        numObj.text = "img${index + 1}.jpg"
    }
}