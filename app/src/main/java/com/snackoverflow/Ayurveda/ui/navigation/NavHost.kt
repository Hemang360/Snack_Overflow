package com.snackoverflow.Ayurveda.ui.navigation

import DataCollectionScreen
import LoginScreen
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.snackoverflow.Ayurveda.ui.screens.DescriptionSection
import com.snackoverflow.Ayurveda.ui.screens.HerbActionScreen
import com.snackoverflow.Ayurveda.ui.screens.LandingScreen
import com.snackoverflow.Ayurveda.ui.screens.PatientDataActionScreen
import com.snackoverflow.Ayurveda.ui.screens.RecordScreen
import com.snackoverflow.Ayurveda.ui.screens.SignUpScreen
import com.snackoverflow.Ayurveda.ui.screens.WorkflowSection
import com.snackoverflow.Ayurveda.viewmodel.SharedRecordViewModel
val sharedRecordViewMode = SharedRecordViewModel()
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
}
@Composable
fun HerbAbhilekh() {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = Screen.Landing.route
    ) {
        composable(Screen.Record.route) {
            RecordScreen(sharedRecordViewMode,navController)
        }
        composable(Screen.Dashboard.route){
            HerbActionScreen(navController)
        }
        composable(Screen.LogData.route){
            PatientDataActionScreen(navController)
        }
        composable(route = Screen.CollectorReport.route){
            DataCollectionScreen(navController)
        }
        composable(route = Screen.Register.route){
            SignUpScreen(navController)
        }
        composable(route = Screen.Login.route){
            LoginScreen(navController)
        }
        composable(route = Screen.Landing.route) {
            LandingScreen(navController)
        }
        composable(route = Screen.Description.route) {
            DescriptionSection(navController)
        }
        composable(route = Screen.WorkFlow.route) {
            WorkflowSection(navController)
        }
    }
}