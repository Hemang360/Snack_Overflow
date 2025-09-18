package com.snackoverflow.Ayurveda.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.snackoverflow.Ayurveda.R
import com.snackoverflow.Ayurveda.ui.navigation.Screen // Added for navigation route

val lightGreen = Color(0xFFC0E1BB)
val darkGreen = Color(0xFF1F261D)

val offWhite = Color(0xFFF7FBF6)

val kalniaFont = FontFamily(
    Font(R.font.kalnia_regular, FontWeight.Normal)
)

val golosFont = FontFamily(
    Font(R.font.golos_text_regular, FontWeight.Normal)
)

@Composable
fun LandingScreen(navController: NavController) {
    HeroSection(
        onGetStartedClicked = {
            // Navigate to the Login screen when "Get Started" is clicked
            navController.navigate(Screen.Description.route)
        }
    )
//    LazyColumn(
//        modifier = Modifier.fillMaxSize(),
//        horizontalAlignment = Alignment.CenterHorizontally
//    ) {
//        item {
//            HeroSection(
//                onGetStartedClicked = {
//                    // Navigate to the Login screen when "Get Started" is clicked
//                    navController.navigate(Screen.Login.route)
//                }
//            )
//        }
//        item {
//            DescriptionSection()
//        }
//    }
}


@Composable
fun HeroSection(onGetStartedClicked: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxHeight()
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
            fontSize = 24.sp,
            color = darkGreen.copy(alpha = 0.8f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(40.dp))
        Button(
            onClick = onGetStartedClicked, // Updated onClick handler
            colors = ButtonDefaults.buttonColors(
                containerColor = darkGreen,
                contentColor = lightGreen
            ),
            shape = MaterialTheme.shapes.large,
            modifier = Modifier
                .height(60.dp)
                .fillMaxWidth(0.8f)
        ) {
            // Replaced Icon and Spacer with new text
            Text(
                text = "Get Started",
                fontFamily = golosFont,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun DescriptionSection(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(lightGreen)
            .padding(horizontal = 32.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Transparency",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = darkGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "from Root to",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = darkGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "Remedy",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = darkGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = "Go beyond the label. Our platform uses blockchain technology to create an unchangeable, transparent record of each herb's journey. Scan a product's QR code to instantly access its complete history—from cultivation details and harvest dates to processing methods and quality certifications.", //\n\nBy decentralizing this information, we remove the guesswork and replace it with verifiable truth. Join us in building a global, trusted ledger of botanical knowledge, ensuring purity and authenticity from source to supplement.",
            fontFamily = golosFont,
            fontSize = 17.sp,
            lineHeight = 26.sp,
            color = darkGreen,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))
        Button(
            onClick = {navController.navigate(Screen.WorkFlow.route)}
        ) {
            Icon(imageVector = Icons.Default.ArrowForward,
                contentDescription = "Go to Description",
                Modifier.size(48.dp))
        }
    }
}

@Composable
fun WorkflowSection(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(darkGreen) // Inverted background for contrast
            .padding(horizontal = 32.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Headline
        Text(
            text = "From Source",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen, // Inverted text color
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "to",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )
        Text(
            text = "Supplement",
            fontFamily = kalniaFont,
            fontSize = 36.sp,
            color = lightGreen,
            textAlign = TextAlign.Center,
            letterSpacing = 1.8.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Workflow Description
        Text(
            text = "The journey begins with registered collectors who log each harvest onto the blockchain, creating a unique digital identity and QR code. Certified labs then test the sample for quality, scanning the code to append their findings as a secure, unchangeable layer of verification. Finally, you can scan the product's code to view this entire transparent history.",
            fontFamily = golosFont,
            fontSize = 17.sp,
            lineHeight = 26.sp,
            color = lightGreen, // Inverted text color
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Navigation Button
        Row {
            Button(
                onClick = { navController.popBackStack() } // Navigates back to the previous screen
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Go Back",
                    modifier = Modifier.size(48.dp)
                )
            }
            Button(
                onClick = { navController.navigate(Screen.Login.route) } // Navigates back to the previous screen
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = "Go Back",
                    modifier = Modifier.size(48.dp)
                )
            }
        }
    }
}

//@Preview(showBackground = true)
//@Composable
//fun LandingScreenPreview() {
//    MaterialTheme {
//        // To preview this screen, you would need to provide a mock NavController.
//        // For example: LandingScreen(navController = rememberNavController())
//    }
//}