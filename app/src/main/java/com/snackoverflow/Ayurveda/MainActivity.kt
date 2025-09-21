package com.snackoverflow.Ayurveda

import DataCollectionScreen
import LoginScreen
import com.snackoverflow.Ayurveda.ui.theme.HerbAbhilekhTheme
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.snackoverflow.Ayurveda.ui.navigation.HerbAbhilekh
import com.snackoverflow.Ayurveda.ui.screens.LandingScreen


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HerbAbhilekhTheme {
                HerbAbhilekh()
            }
        }
    }
}