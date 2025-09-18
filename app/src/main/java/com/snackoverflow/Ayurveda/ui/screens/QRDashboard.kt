package com.snackoverflow.Ayurveda.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Subject
import androidx.compose.material.icons.filled.Addchart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.snackoverflow.Ayurveda.ui.navigation.Screen

// --- A more refined color palette for a beautiful UI ---
val screenBackgroundStart = Color(0xFFE6F0E4)
val screenBackgroundEnd = Color(0xFFC0E1BB)
val cardBackground = Color(0xFFFFFFFF)
val primaryText = Color(0xFF1F261D)
val secondaryText = Color(0xFF495A46)
val iconBackground = Color(0xFFD9EAD6)
val iconTint = Color(0xFF2E6B2A)

// Assume these fonts are defined in a Theme file, similar to previous examples
// val kalniaFont: FontFamily
// val golosFont: FontFamily

@Composable
fun HerbActionScreen(navController: NavController) {
    // A subtle gradient background is more visually appealing than a flat color
    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(screenBackgroundStart, screenBackgroundEnd)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = backgroundBrush),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(64.dp))

            // --- Header Text for Context ---
            Text(
                text = "Dashboard",
                // fontFamily = kalniaFont, // Use your brand's display font
                fontSize = 38.sp,
                color = primaryText
            )
            Text(
                text = "Select an action to continue",
                // fontFamily = golosFont, // Use your brand's body font
                fontSize = 16.sp,
                color = secondaryText
            )

            Spacer(modifier = Modifier.height(48.dp))

            // --- Replaced Buttons with beautiful, descriptive Cards ---
            ActionCard(
                title = "View Herb Data",
                description = "Trace a herb's journey on the blockchain.",
                icon = Icons.AutoMirrored.Filled.Subject, // A more descriptive icon
                onClick = {
                    navController.navigate(Screen.Record.route)
                }
            )

            Spacer(modifier = Modifier.height(20.dp))

            ActionCard(
                title = "Enter New Herb Details",
                description = "Add a new collection or lab report.",
                icon = Icons.Default.Addchart, // A more descriptive icon
                onClick = {
                    navController.navigate(Screen.CollectorReport.route)
                }
            )
        }
    }
}

@Composable
fun ActionCard(
    title: String,
    description: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = cardBackground
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 20.dp, vertical = 24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // --- Icon with its own background for emphasis ---
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(iconBackground),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    modifier = Modifier.size(28.dp),
                    tint = iconTint
                )
            }

            Spacer(modifier = Modifier.width(20.dp))

            // --- Column for Title and Description ---
            Column {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = primaryText,
                    // fontFamily = golosFont
                )
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = secondaryText,
                    // fontFamily = golosFont
                )
            }
        }
    }
}

@Preview(showBackground = true, device = "id:pixel_6")
@Composable
fun HerbActionScreenPreview() {
    // Use a rememberNavController for the preview to work
    HerbActionScreen(navController = rememberNavController())
}