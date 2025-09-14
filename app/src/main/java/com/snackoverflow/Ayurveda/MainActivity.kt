package com.snackoverflow.Ayurveda

import LoginScreen
import LoginScreenTheme
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.snackoverflow.Ayurveda.ui.screens.HerbActionScreen
import com.snackoverflow.Ayurveda.ui.screens.LandingScreen
import com.snackoverflow.Ayurveda.ui.theme.AyurvedaBlockChainTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LoginScreenTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    LandingScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}