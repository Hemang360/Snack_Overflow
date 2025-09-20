package com.snackoverflow.Ayurveda.ui.screens

import android.util.Log
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

// Data classes remain the same
@Serializable
data class BatchDetailsResponse(
    val success: Boolean,
    val data: BatchData?
)

@Serializable
data class BatchData(
    val batchId: String,
    val herbName: String,
    val collectorId: String,
    val farmLocation: String,
    val quantity: String,
    val harvestDate: String,
    val environmentalData: EnvironmentalData,
    val gpsCoordinates: GpsCoordinates,
    val qualityStatus: String? = null,
    val status: String? = null
)

@Serializable
data class EnvironmentalData(
    val temperature: String,
    val humidity: String,
    val soilType: String
)

@Serializable
data class GpsCoordinates(
    val latitude: Double,
    val longitude: Double
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BatchDetailsScreen(navController: NavController) {
    var batchId by remember { mutableStateOf("") }
    val userId by remember { mutableStateOf("Farmer01") } // Kept as per original logic
    var isLoading by remember { mutableStateOf(false) }
    var batchData by remember { mutableStateOf<BatchData?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) } // For displaying errors in the UI

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val client = remember {
        HttpClient(CIO) {
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true })
            }
        }
    }

    fun fetchDetails() {
        if (batchId.isBlank()) {
            Toast.makeText(context, "Please enter a batch ID", Toast.LENGTH_SHORT).show()
            return
        }
        scope.launch {
            isLoading = true
            batchData = null
            errorMessage = null
            try {
                val response = client.post("https://4fefd4396559.ngrok-free.app/getBatchDetails") {
                    contentType(ContentType.Application.Json)
                    setBody(mapOf("userId" to userId, "batchId" to batchId))
                }

                if (response.status.isSuccess()) {
                    val parsedResponse = response.body<BatchDetailsResponse>()
                    if (parsedResponse.success && parsedResponse.data != null) {
                        batchData = parsedResponse.data
                    } else {
                        errorMessage = "Failed to fetch batch data or batch not found."
                        Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show()
                    }
                } else {
                    val errorBody = response.bodyAsText()
                    errorMessage = "Error ${response.status.value}: Server responded with an error."
                    Log.e("BatchDetails", "Error ${response.status.value}: $errorBody")
                    Toast.makeText(context, "Error: ${response.status.description}", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                errorMessage = "Request failed: ${e.message}"
                Log.e("BatchDetails", "Request failed", e)
                Toast.makeText(context, "Request failed. Check network connection.", Toast.LENGTH_LONG).show()
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Batch Details") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1A2118), // Set TopAppBar background color
                    titleContentColor = Color.White,       // Set text color for contrast
                    navigationIconContentColor = Color.White // Set icon color for contrast
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = batchId,
                onValueChange = { batchId = it },
                label = { Text("Enter Batch ID") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            Button(
                onClick = { fetchDetails() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 3.dp
                    )
                } else {
                    Text("Fetch Batch Details", style = MaterialTheme.typography.bodyLarge)
                }
            }

            Spacer(Modifier.height(24.dp))

            when {
                isLoading -> {
                    // Loading state is handled by the button
                }
                errorMessage != null -> {
                    Text(
                        text = errorMessage!!,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                batchData != null -> {
                    AnimatedVisibility(
                        visible = true,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        BatchDataCard(data = batchData!!)
                    }
                }
                else -> {
                    Text(
                        text = "Enter a Batch ID and press 'Fetch' to see details.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun BatchDataCard(data: BatchData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SectionTitle("Core Information")
            DetailItem(icon = Icons.Default.Info, label = "Batch ID", value = data.batchId)
            DetailItem(icon = Icons.Default.Grass, label = "Herb Name", value = data.herbName)
            DetailItem(icon = Icons.Default.Person, label = "Collector", value = data.collectorId)
            DetailItem(icon = Icons.Default.Eco, label = "Farm Location", value = data.farmLocation)
            DetailItem(icon = Icons.Default.Scale, label = "Quantity", value = data.quantity)
            DetailItem(icon = Icons.Default.CalendarToday, label = "Harvest Date", value = data.harvestDate)

            SectionTitle("Environmental Conditions")
            DetailItem(icon = Icons.Default.Thermostat, label = "Temperature", value = data.environmentalData.temperature)
            DetailItem(icon = Icons.Default.WaterDrop, label = "Humidity", value = data.environmentalData.humidity)
            DetailItem(icon = Icons.Default.Landscape, label = "Soil Type", value = data.environmentalData.soilType)

            SectionTitle("Location")
            DetailItem(icon = Icons.Default.GpsFixed, label = "Latitude", value = data.gpsCoordinates.latitude.toString())
            DetailItem(icon = Icons.Default.GpsFixed, label = "Longitude", value = data.gpsCoordinates.longitude.toString())

            // Optional Fields
            if (data.qualityStatus != null || data.status != null) {
                SectionTitle("Status")
                data.qualityStatus?.let {
                    DetailItem(icon = Icons.Default.Verified, label = "Quality Status", value = it)
                }
                data.status?.let {
                    DetailItem(icon = Icons.Default.CheckCircle, label = "Overall Status", value = it)
                }
            }
        }
    }
}

@Composable
private fun SectionTitle(title: String) {
    Column {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Divider(modifier = Modifier.padding(top = 4.dp))
    }
}


@Composable
private fun DetailItem(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
        )
        Spacer(Modifier.width(16.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.End
        )
    }
}

@Preview(showBackground = true)
@Composable
fun BatchDetailsScreenPreview() {
    BatchDetailsScreen(navController = rememberNavController())
}