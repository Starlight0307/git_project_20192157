package com.example.a11th

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {

    /*
    lateinit var button: Button
    lateinit var img1: ImageView
    lateinit var img2: ImageView
    */

    lateinit var btObj1 : ImageButton
    lateinit var btObj2 : ImageButton
    lateinit var btObj3 : ImageButton
    lateinit var btObj4 : ImageButton
    lateinit var ivObj : ImageView



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        /*
        button = findViewById(R.id.button_id)
        img1 = findViewById(R.id.img1)
        img2 = findViewById(R.id.img2)
        */

        btObj1 = findViewById(R.id.button1)
        btObj2 = findViewById(R.id.button2)
        btObj3 = findViewById(R.id.button3)
        btObj4 = findViewById(R.id.button4)

        ivObj = findViewById(R.id.imageView2)

        btObj1.setOnClickListener(View.OnClickListener {
            ivObj.setVisibility(View.VISIBLE)   //이미지 뷰가 보이도록 설정
            ivObj.setImageResource(R.drawable.answer1)   //이미지 리소스 변경
            Toast.makeText(getApplicationContext(),"틀렸습니다", Toast.LENGTH_SHORT).show()
        })

        btObj2.setOnClickListener(View.OnClickListener {
            ivObj.setVisibility(View.VISIBLE)
            ivObj.setImageResource(R.drawable.answer2)
            Toast.makeText(getApplicationContext(),"맞았습니다", Toast.LENGTH_SHORT).show()
        })

        btObj3.setOnClickListener(View.OnClickListener {
            ivObj.setVisibility(View.VISIBLE)
            ivObj.setImageResource(R.drawable.answer3)
            Toast.makeText(getApplicationContext(),"틀렸습니다", Toast.LENGTH_SHORT).show()
        })

        btObj4.setOnClickListener(View.OnClickListener {
            ivObj.setVisibility(View.VISIBLE)
            ivObj.setImageResource(R.drawable.answer4)
            Toast.makeText(getApplicationContext(),"틀렸습니다", Toast.LENGTH_SHORT).show()
        })

    }
    /*
    fun onButtonClick(view: View?){
        if (img1.visibility == View.VISIBLE) {
            button.text = "버튼"
            img1.visibility = View.INVISIBLE
            img2.visibility = View.INVISIBLE
        } else {
            button.text = "버튼 클릭 이벤트"
            img1.visibility = View.VISIBLE
            img2.visibility = View.VISIBLE
        }

    }
    */

}