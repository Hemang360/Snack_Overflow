package com.snackoverflow.Ayurveda.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.snackoverflow.Ayurveda.R

val lightGreen = Color(0xFFC0E1BB)
val darkGreen = Color(0xFF1F261D)

val kalniaFont = FontFamily(
    Font(R.font.kalnia_regular, FontWeight.Normal)
)

val golosFont = FontFamily(
    Font(R.font.golos_text_regular, FontWeight.Normal)
)

@Composable
fun LandingScreen(modifier: Modifier) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            HeroSection(
                onScanClicked = { }
            )
        }
        item {
            FeaturesSection()
        }
    }
}

@Composable
fun HeroSection(onScanClicked: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(lightGreen)
            .padding(horizontal = 24.dp, vertical = 64.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to [Put Name]",
            fontFamily = kalniaFont,
            fontSize = 48.sp,
            lineHeight = 52.sp,
            color = darkGreen,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Scan a QR, trace the herb, trust the blockchain.",
            fontFamily = golosFont,
            fontSize = 18.sp,
            color = darkGreen.copy(alpha = 0.8f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(40.dp))
        Button(
            onClick = onScanClicked,
            colors = ButtonDefaults.buttonColors(
                containerColor = darkGreen,
                contentColor = lightGreen
            ),
            shape = MaterialTheme.shapes.large,
            modifier = Modifier
                .height(60.dp)
                .fillMaxWidth(0.8f)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.qr_code_scan),
                contentDescription = "QR Scanner Icon"
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Scan QR Code",
                fontFamily = golosFont,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun FeaturesSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(darkGreen)
            .padding(horizontal = 24.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "More Than Just a Scanner",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(40.dp))
        FeatureItem(emoji = "⚡️", title = "Blazing Fast", description = "Reads any QR or barcode in a fraction of a second.")
        Spacer(modifier = Modifier.height(24.dp))
        FeatureItem(emoji = "📜", title = "Scan History", description = "Never lose a link with your complete, searchable history.")
        Spacer(modifier = Modifier.height(24.dp))
        FeatureItem(emoji = "🛡️", title = "Always Secure", description = "We check every link to protect you from malicious sites.")
    }
}

@Composable
fun FeatureItem(emoji: String, title: String, description: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "$emoji $title",
            fontFamily = golosFont,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = lightGreen
        )
        Text(
            text = description,
            fontFamily = golosFont,
            fontSize = 16.sp,
            color = lightGreen.copy(alpha = 0.8f),
            textAlign = TextAlign.Center
        )
    }
}

@Preview(showBackground = true)
@Composable
fun LandingScreenPreview() {
    MaterialTheme {
        LandingScreen(modifier = Modifier)
    }
}