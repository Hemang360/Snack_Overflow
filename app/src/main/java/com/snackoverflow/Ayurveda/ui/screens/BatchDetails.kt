package com.snackoverflow.Ayurveda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import android.util.Log
import io.ktor.client.statement.bodyAsText

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
    var userId by remember { mutableStateOf("Farmer01") }
    var isLoading by remember { mutableStateOf(false) }
    var batchData by remember { mutableStateOf<BatchData?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val client = remember {
        HttpClient(CIO) {
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true })
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
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = batchId,
                onValueChange = { batchId = it },
                label = { Text("Enter Batch ID") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    if (batchId.isBlank()) {
                        Toast.makeText(context, "Please enter a batch ID", Toast.LENGTH_SHORT).show()
                        return@Button
                    }

                    scope.launch {
                        isLoading = true
                        try {
                            val requestPayload = mapOf(
                                "userId" to userId,
                                "batchId" to batchId
                            )
                            val response = client.post("http://192.168.1.8:5000/getBatchDetails") {
                                contentType(ContentType.Application.Json)
                                setBody(requestPayload)
                            }

                            if (response.status.isSuccess()) {
                                val parsedResponse = response.body<BatchDetailsResponse>()
                                if (parsedResponse.success) {
                                    batchData = parsedResponse.data
                                } else {
                                    Toast.makeText(context, "Failed to fetch batch data", Toast.LENGTH_SHORT).show()
                                }
                            } else {
                                val errorBody = response.bodyAsText()
                                Toast.makeText(context, "Error: ${response.status.value}", Toast.LENGTH_LONG).show()
                                Log.e("BatchDetails", "Error ${response.status.value}: $errorBody")
                            }
                        } catch (e: Exception) {
                            Log.e("BatchDetails", "Request failed", e)
                            Toast.makeText(context, "Request failed: ${e.message}", Toast.LENGTH_LONG).show()
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Fetch Batch Details")
                }
            }

            batchData?.let { data ->
                Text("Batch Details", style = MaterialTheme.typography.titleMedium)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFEFEFEF), RoundedCornerShape(8.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Batch ID: ${data.batchId}", fontFamily = FontFamily.Monospace)
                    Text("Herb Name: ${data.herbName}", fontFamily = FontFamily.Monospace)
                    Text("Collector: ${data.collectorId}", fontFamily = FontFamily.Monospace)
                    Text("Farm Location: ${data.farmLocation}", fontFamily = FontFamily.Monospace)
                    Text("Quantity: ${data.quantity}", fontFamily = FontFamily.Monospace)
                    Text("Harvest Date: ${data.harvestDate}", fontFamily = FontFamily.Monospace)
                    Text("Temperature: ${data.environmentalData.temperature}", fontFamily = FontFamily.Monospace)
                    Text("Humidity: ${data.environmentalData.humidity}", fontFamily = FontFamily.Monospace)
                    Text("Soil Type: ${data.environmentalData.soilType}", fontFamily = FontFamily.Monospace)
                    Text("Latitude: ${data.gpsCoordinates.latitude}", fontFamily = FontFamily.Monospace)
                    Text("Longitude: ${data.gpsCoordinates.longitude}", fontFamily = FontFamily.Monospace)
                    data.qualityStatus?.let { Text("Quality Status: $it") }
                    data.status?.let { Text("Status: $it") }
                }
            }
        }
    }
}
