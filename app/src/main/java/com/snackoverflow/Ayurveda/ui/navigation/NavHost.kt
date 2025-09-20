package com.snackoverflow.Ayurveda.ui.navigation

import DataCollectionScreen
import LoginScreen
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.snackoverflow.Ayurveda.ui.screens.BatchDetailsScreen
import com.snackoverflow.Ayurveda.ui.screens.DescriptionSection
import com.snackoverflow.Ayurveda.ui.screens.HerbActionScreen
import com.snackoverflow.Ayurveda.ui.screens.LandingScreen
import com.snackoverflow.Ayurveda.ui.screens.PatientDataActionScreen
import com.snackoverflow.Ayurveda.ui.screens.RecordScreen
import com.snackoverflow.Ayurveda.ui.screens.SignUpScreen
import com.snackoverflow.Ayurveda.ui.screens.WorkflowSection
import com.snackoverflow.Ayurveda.viewmodel.SharedRecordViewModel
val sharedRecordViewModel = SharedRecordViewModel()

// Screen routes
sealed class Screen(val route: String) {
    object Landing : Screen("landing")
    object Login : Screen("login")
    object Register : Screen("register")
    object Record : Screen("record")
    object Dashboard : Screen("dashboard")
    object LogData : Screen("logData")
    object CollectorReport : Screen("collector-report")
    object Description : Screen("description")
    object WorkFlow : Screen("workflow")
    object BatchDetails : Screen("batch_details")
}

@Composable
fun HerbAbhilekh() {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = Screen.Landing.route
    ) {
        composable(Screen.Record.route) {
            RecordScreen(sharedRecordViewModel, navController)
        }
        composable(Screen.Dashboard.route) {
            HerbActionScreen(navController)
        }
        composable(Screen.LogData.route) {
            PatientDataActionScreen(navController)
        }
        composable(Screen.CollectorReport.route) {
            DataCollectionScreen(navController)
        }
        composable(Screen.Register.route) {
            SignUpScreen(navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController)
        }
        composable(Screen.Landing.route) {
            LandingScreen(navController)
        }
        composable(Screen.Description.route) {
            DescriptionSection(navController)
        }
        composable(Screen.WorkFlow.route) {
            WorkflowSection(navController)
        }
        composable(Screen.BatchDetails.route) {
            BatchDetailsScreen(navController)
        }
    }
}
