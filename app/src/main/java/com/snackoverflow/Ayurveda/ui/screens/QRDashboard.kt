package com.snackoverflow.Ayurveda.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

val lightGreenBg = Color(0xFFC0E1BB)
val darkGreenText = Color(0xFF1F261D)

@Composable
fun HerbActionScreen(navController: NavController) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = lightGreenBg
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(48.dp))
            ActionButton(
                text = "View Herb Info",
                icon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "View Blockchain Data",
                        modifier = Modifier.size(44.dp),
                        tint = darkGreenText
                    )
                },
                onClick = { /* TODO: Add navigation or action for viewing herb info */ }
            )
            Spacer(modifier = Modifier.height(20.dp))

            // This button remains the same
            ActionButton(
                text = "Log Data into Blockchain",
                icon = {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Log Data into Blockchain",
                        modifier = Modifier.size(44.dp),
                        tint = darkGreenText
                    )
                },
                onClick = { /*TODO : Handle Navigation*/}
            )
        }
    }
}
@Composable
fun ActionButton(
    text: String,
    icon: @Composable () -> Unit,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = darkGreenText
        ),
        modifier = Modifier
            .fillMaxWidth()
            .height(90.dp),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            Spacer(modifier = Modifier.width(8.dp))

            icon()

            Spacer(modifier = Modifier.width(20.dp))

            Text(
                text = text,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = darkGreenText
            )
        }
    }
}

@Preview(showBackground = true, device = "id:pixel_6")
@Composable
fun HerbActionScreenPreview() {
    //HerbActionScreen()
}