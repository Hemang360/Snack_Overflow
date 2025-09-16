package com.snackoverflow.Ayurveda.ui.navigation

import LoginScreen
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.snackoverflow.Ayurveda.ui.screens.HerbActionScreen
import com.snackoverflow.Ayurveda.ui.screens.RecordScreen
import com.snackoverflow.Ayurveda.viewmodel.SharedRecordViewModel
val sharedRecordViewMode = SharedRecordViewModel()
sealed class Screen(val route: String) {
    object Landing : Screen("landing")
    object Login : Screen("login")
    object Register : Screen("register")
    object Record : Screen("record")
    object Dashboard : Screen("dashboard")
}
@Composable
fun HerbAbhilekh() {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard
    ) {
        composable(Screen.Record.route) {
            RecordScreen(sharedRecordViewMode,navController)
        }
        composable(Screen.Dashboard.route){
            HerbActionScreen(navController)
        }
    }
}