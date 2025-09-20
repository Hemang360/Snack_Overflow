// REQUIRED IMPORTS
import android.Manifest
import android.app.DatePickerDialog
import android.content.Context
import android.content.pm.PackageManager
import android.widget.DatePicker
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.snackoverflow.Ayurveda.TokenManager
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.snackoverflow.Ayurveda.R // <-- Ensure this path is correct for your project
import com.snackoverflow.Ayurveda.ui.navigation.Screen // <-- Ensure this path is correct
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
import java.util.Calendar

// --- Updated Data classes for request to match the target JSON format ---
@Serializable
data class GPSCoordinates(
    val latitude: Double,
    val longitude: Double
)

@Serializable
data class HerbBatchRequest(
    val batchId: String,
    val herbName: String,
    val scientificName: String,
    val harvestDate: String,
    val farmLocation: String,
    val quantity: Double, // Changed to Double
    val unit: String,
    val gpsCoordinates: GPSCoordinates,
    val collectorId: String,
    val cultivationMethod: String,
    val harvestMethod: String,
    val plantPart: String
)

// --- Helper Function for Safe Location Access ---
private fun requestCurrentLocation(
    context: Context,
    fusedLocationClient: FusedLocationProviderClient,
    onLocationFetched: (lat: String, lon: String) -> Unit
) {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    ) {
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
            .addOnSuccessListener { location ->
                location?.let {
                    onLocationFetched(it.latitude.toString(), it.longitude.toString())
                }
            }
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataCollectionScreen(navController: NavController) {
    // --- State Management for all form fields ---
    var herbName by remember { mutableStateOf("") }
    var scientificName by remember { mutableStateOf("") }
    var collectorId by remember { mutableStateOf("") }
    var latitude by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("") }
    var harvestDate by remember { mutableStateOf("Select Harvest Date") }
    var farmLocation by remember { mutableStateOf("") }
    var cultivationMethod by remember { mutableStateOf("") }
    var harvestMethod by remember { mutableStateOf("") }
    var plantPart by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(false) }
    var showQrCodeDialog by remember { mutableStateOf(false) }

    // --- Context and Scopes ---
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tokenManager = remember { TokenManager(context) }

    // --- Ktor HTTP Client for your backend ---
    val client = remember { HttpClient(CIO) { install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) } } }

    // --- Location Services ---
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { permissions ->
            if (permissions.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false) ||
                permissions.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false)) {
                requestCurrentLocation(context, fusedLocationClient) { lat, lon ->
                    latitude = lat
                    longitude = lon
                }
            } else {
                Toast.makeText(context, "Location permission denied", Toast.LENGTH_SHORT).show()
            }
        }
    )

    // --- Form Validation ---
    val isFormValid by remember(
        herbName, scientificName, collectorId, latitude, longitude, quantity,
        unit, harvestDate, farmLocation, cultivationMethod, harvestMethod, plantPart
    ) {
        derivedStateOf {
            herbName.isNotBlank() &&
                    scientificName.isNotBlank() &&
                    collectorId.isNotBlank() &&
                    latitude.isNotBlank() &&
                    longitude.isNotBlank() &&
                    quantity.toDoubleOrNull() != null &&
                    unit.isNotBlank() &&
                    harvestDate != "Select Harvest Date" &&
                    farmLocation.isNotBlank() &&
                    cultivationMethod.isNotBlank() &&
                    harvestMethod.isNotBlank() &&
                    plantPart.isNotBlank()
        }
    }

    // --- Date Picker Dialog ---
    val calendar = Calendar.getInstance()
    val datePickerDialog = DatePickerDialog(context,
        { _: DatePicker, year: Int, month: Int, day: Int ->
            harvestDate = "$year-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}"
        },
        calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)
    )

    // --- QR Code Dialog ---
    if (showQrCodeDialog) {
        AlertDialog(
            onDismissRequest = { showQrCodeDialog = false; navController.popBackStack() },
            title = { Text("Submission Successful!") },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Make sure you have a 'qr.png' or similar in your drawable resources
                    Image(painter = painterResource(id = R.drawable.qr), contentDescription = "Generated QR Code")
                }
            },
            confirmButton = { TextButton(onClick = { showQrCodeDialog = false; navController.popBackStack() }) { Text("Done") } }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Herb Data Collection") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) { // Corrected navigation
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.padding(paddingValues).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp), // Adjusted spacing
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // --- NEW Form Fields ---
            item { OutlinedTextField(value = herbName, onValueChange = { herbName = it }, label = { Text("Herb Name") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = scientificName, onValueChange = { scientificName = it }, label = { Text("Scientific Name") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = collectorId, onValueChange = { collectorId = it }, label = { Text("Collector ID") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = farmLocation, onValueChange = { farmLocation = it }, label = { Text("Farm Location") }, modifier = Modifier.fillMaxWidth()) }

            // --- Quantity and Unit on the same row ---
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = quantity,
                        onValueChange = { quantity = it },
                        label = { Text("Quantity") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = unit,
                        onValueChange = { unit = it },
                        label = { Text("Unit (e.g., kg)") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // --- Location Fields ---
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {
                        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                            requestCurrentLocation(context, fusedLocationClient) { lat, lon -> latitude = lat; longitude = lon }
                        } else {
                            locationPermissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                        }
                    }, modifier = Modifier.fillMaxWidth()) {
                        Icon(imageVector = Icons.Default.MyLocation, contentDescription = "Get Location", modifier = Modifier.padding(end = 8.dp))
                        Text("Get Current Location")
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = latitude, onValueChange = {}, readOnly = true, label = { Text("Latitude") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = longitude, onValueChange = {}, readOnly = true, label = { Text("Longitude") }, modifier = Modifier.weight(1f))
                    }
                }
            }

            // --- Date Picker Button ---
            item { OutlinedButton(onClick = { datePickerDialog.show() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)) { Text(text = harvestDate, modifier = Modifier.padding(vertical = 8.dp)) } }

            // --- More NEW Fields ---
            item { OutlinedTextField(value = cultivationMethod, onValueChange = { cultivationMethod = it }, label = { Text("Cultivation Method") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = harvestMethod, onValueChange = { harvestMethod = it }, label = { Text("Harvest Method") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = plantPart, onValueChange = { plantPart = it }, label = { Text("Plant Part Used") }, modifier = Modifier.fillMaxWidth()) }


            // --- Submit Button ---
            item {
                Spacer(modifier = Modifier.height(8.dp)) // Add some space before the button
                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            try {
                                // Hardcoded JWT token for testing
                                val jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYXJtZXJfMTc1ODM5OTc3MzY3Nl8xOWIxNThiMyIsInJvbGUiOiJmYXJtZXIiLCJlbWFpbCI6InNoYW5raGFuaWxzYWhhQGdtYWlsLmNvbSIsImRldmljZUluZm8iOnsidHlwZSI6IndlYiIsInVzZXJBZ2VudCI6ImN1cmwvOC4xNi4wIiwiaXAiOiI6OjEiLCJ0aW1lc3RhbXAiOiIyMDI1LTA5LTIwVDIwOjU1OjUyLjUyNFoifSwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1ODQwMTc1MiwiZXhwIjoxNzU4NDAyNjUyLCJhdWQiOiJheXVydmVkYS11c2VycyIsImlzcyI6ImF5dXJ2ZWRhLXN1cHBseS1jaGFpbiJ9.zJes8dgsvX3pH2RK-HUXTGAVf4avyNR28QHZfada4vw"
                                
                                // Debug: Log the token (first 50 characters for security)
                                android.util.Log.d("DataCollection", "Using hardcoded JWT token: ${jwtToken.take(50)}...")

                                // Construct the request body from the form state
                                val herbBatchRequest = HerbBatchRequest(
                                    batchId = "BATCH-${System.currentTimeMillis()}", // Generate a unique batch ID
                                    herbName = herbName,
                                    scientificName = scientificName,
                                    harvestDate = harvestDate,
                                    farmLocation = farmLocation,
                                    quantity = quantity.toDoubleOrNull() ?: 0.0,
                                    unit = unit,
                                    gpsCoordinates = GPSCoordinates(
                                        latitude.toDoubleOrNull() ?: 0.0,
                                        longitude.toDoubleOrNull() ?: 0.0
                                    ),
                                    collectorId = collectorId,
                                    cultivationMethod = cultivationMethod,
                                    harvestMethod = harvestMethod,
                                    plantPart = plantPart
                                )

                                // Send the POST request to your backend
                                val authHeader = "Bearer $jwtToken"
                                android.util.Log.d("DataCollection", "Authorization header: $authHeader")
                                android.util.Log.d("DataCollection", "Token format check - starts with 'eyJ': ${jwtToken.startsWith("eyJ")}")
                                android.util.Log.d("DataCollection", "Token parts count: ${jwtToken.split(".").size}")
                                
                                val response = client.post("https://4fefd4396559.ngrok-free.app/createHerbBatch") {
                                    header(HttpHeaders.Authorization, authHeader)
                                    contentType(ContentType.Application.Json)
                                    setBody(herbBatchRequest)
                                }

                                if (response.status.isSuccess()) {
                                    showQrCodeDialog = true
                                } else {
                                    val errorBody = response.body<String>()
                                    android.util.Log.e("DataCollection", "API Error ${response.status.value}: $errorBody")
                                    android.util.Log.e("DataCollection", "Response headers: ${response.headers}")
                                    
                                    // Check if it's a token-related error
                                    if (response.status.value == 401 || errorBody.contains("token", ignoreCase = true)) {
                                        Toast.makeText(context, "Authentication failed. Please login again.", Toast.LENGTH_LONG).show()
                                        // Clear the invalid token
                                        tokenManager.clearToken()
                                    } else {
                                        Toast.makeText(context, "API Error: ${response.status.value} - $errorBody", Toast.LENGTH_LONG).show()
                                    }
                                }

                            } catch (e: Exception) {
                                android.util.Log.e("DataCollection", "Submission failed", e)
                                Toast.makeText(context, "Submission failed: ${e.message}", Toast.LENGTH_LONG).show()
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    enabled = isFormValid && !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Submit Data")
                    }
                }
            }
        }
    }
}