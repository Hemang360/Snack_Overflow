package com.snackoverflow.Ayurveda.ui.screens

import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.MailOutline
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.snackoverflow.Ayurveda.ui.navigation.Screen

@Composable
fun PatientDataActionScreen(navController: NavController) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = lightGreenBg
    ) {
        Column {
            Spacer(modifier = Modifier.height(48.dp))
            IconButton(
                onClick = {
                    navController.navigate(Screen.Dashboard.route)
                }
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Go Back to Home Page",
                    modifier = Modifier.size(28.dp)
                )
            }
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(4.dp))
                // Button 1: Log Patient Data
                ActionButton(
                    text = "Log Patient Data",
                    icon = {
                        Icon(
                            imageVector = Icons.Default.AccountCircle,
                            contentDescription = "Log Patient Data",
                            modifier = Modifier.size(44.dp),
                            tint = darkGreenText
                        )
                    },
                    onClick = { /*TODO: Handle Navigation to Patient Data Logging Screen*/ }
                )
                Spacer(modifier = Modifier.height(20.dp))

                // Button 2: Lab Reports
                ActionButton(
                    text = "Lab Reports",
                    icon = {
                        Icon(
                            imageVector = Icons.Default.DateRange,
                            contentDescription = "Lab Reports",
                            modifier = Modifier.size(44.dp),
                            tint = darkGreenText
                        )
                    },
                    onClick = { /*TODO: Handle Navigation to Lab Reports Screen*/ }
                )
                Spacer(modifier = Modifier.height(20.dp))

                // Button 3: Medical Reports
                ActionButton(
                    text = "Medical Reports",
                    icon = {
                        Icon(
                            imageVector = Icons.Default.MailOutline,
                            contentDescription = "Medical Reports",
                            modifier = Modifier.size(44.dp),
                            tint = darkGreenText
                        )
                    },
                    onClick = { /*TODO: Handle Navigation to Medical Reports Screen*/ }
                )
            }
        }
    }
}

/**
 * This is the same reusable ActionButton composable from the reference file.
 * No changes are needed here.
 */
//@Composable
//fun ActionButton(
//    text: String,
//    icon: @Composable () -> Unit,
//    onClick: () -> Unit
//) {
//    Button(
//        onClick = onClick,
//        shape = RoundedCornerShape(16.dp),
//        colors = ButtonDefaults.buttonColors(
//            containerColor = Color.White,
//            contentColor = darkGreenText
//        ),
//        modifier = Modifier
//            .fillMaxWidth()
//            .height(90.dp),
//        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
//    ) {
//        Row(
//            modifier = Modifier.fillMaxWidth(),
//            verticalAlignment = Alignment.CenterVertically,
//            horizontalArrangement = Arrangement.Start
//        ) {
//            Spacer(modifier = Modifier.width(8.dp))
//
//            icon()
//
//            Spacer(modifier = Modifier.width(20.dp))
//
//            Text(
//                text = text,
//                fontWeight = FontWeight.Bold,
//                fontSize = 18.sp,
//                color = darkGreenText
//            )
//        }
//    }
//}

@Preview(showBackground = true, device = "id:pixel_6")
@Composable
fun PatientDataActionScreenPreview() {
    // We use rememberNavController() for the preview to work
    val navController = rememberNavController()
    PatientDataActionScreen(navController = navController)
}