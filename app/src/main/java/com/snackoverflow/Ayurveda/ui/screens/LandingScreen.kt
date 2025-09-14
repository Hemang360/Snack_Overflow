package com.snackoverflow.Ayurveda.ui.screens

import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.snackoverflow.Ayurveda.QrCodeScanner
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
    var showScanner by remember { mutableStateOf(false) }
    var scannedCode by remember { mutableStateOf<String?>(null) }

    if (showScanner) {
        QrCodeScanner(
            onQrCodeScanned = { qrCode ->
                scannedCode = qrCode
                showScanner = false
                Log.d("LandingScreen", "Scanned QR Code: $qrCode")
            },
            onNavigateBack = {
                showScanner = false
            }
        )
    } else {
        LazyColumn(
            modifier = modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                HeroSection(
                    onScanClicked = {
                        showScanner = true
                    }
                )
            }
            item {
                DescriptionSection()
            }
            scannedCode?.let { code ->
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Last Scanned Code:",
                            fontFamily = golosFont,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = code,
                            fontFamily = golosFont,
                            fontSize = 16.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }
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
            text = "Welcome to",
            fontFamily = kalniaFont,
            fontSize = 48.sp,
            lineHeight = 52.sp,
            color = darkGreen,
            textAlign = TextAlign.Center
        )
        Text(
            text = "Herb Abhilekh",
            fontFamily = kalniaFont,
            fontSize = 46.sp,
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
fun DescriptionSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(darkGreen)
            .padding(horizontal = 32.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Transparency",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "from Root to",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "Remedy",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = "Go beyond the label. Our platform uses blockchain technology to create an unchangeable, transparent record of each herb's journey. Scan a product's QR code to instantly access its complete history—from cultivation details and harvest dates to processing methods and quality certifications.\n\nBy decentralizing this information, we remove the guesswork and replace it with verifiable truth. Join us in building a global, trusted ledger of botanical knowledge, ensuring purity and authenticity from source to supplement.",
            fontFamily = golosFont,
            fontSize = 17.sp,
            lineHeight = 26.sp,
            color = lightGreen.copy(alpha = 0.85f),
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