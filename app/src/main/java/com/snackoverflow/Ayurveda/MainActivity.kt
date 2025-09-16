package com.snackoverflow.Ayurveda

import LoginScreen
import LoginScreenTheme
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.snackoverflow.Ayurveda.ui.navigation.HerbAbhilekh


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LoginScreenTheme {
                HerbAbhilekh()
            }
        }
    }
}