// REQUIRED IMPORTS
import android.Manifest
import android.app.DatePickerDialog
import android.content.Context
import android.content.pm.PackageManager
import android.widget.DatePicker
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.snackoverflow.Ayurveda.ui.navigation.Screen // Make sure this path is correct
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.Calendar

// --- Data Models ---
@Serializable
data class LocationData(
    val latitude: Double,
    val longitude: Double
)

// --- Helper Function for Safe Location Access ---
private fun requestCurrentLocation(
    context: Context,
    fusedLocationClient: FusedLocationProviderClient,
    onLocationFetched: (lat: String, lon: String) -> Unit
) {
    // This explicit check satisfies the Android lint warning for permissions.
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
    // --- State Management ---
    var species by remember { mutableStateOf("") }
    var collectorId by remember { mutableStateOf("") }
    var latitude by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("") }
    var collectionDate by remember { mutableStateOf("Select Collection Date") }
    var qualityNotes by remember { mutableStateOf("") }
    var herbImage by remember { mutableStateOf("") } // Represents a URL or text identifier
    var isLoading by remember { mutableStateOf(false) }

    // --- Context and Scopes ---
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // --- Ktor HTTP Client ---
    val client = remember { HttpClient(CIO) { install(ContentNegotiation) { json() } } }

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
    val isFormValid by remember(species, collectorId, latitude, longitude, quantity, collectionDate, qualityNotes, herbImage) {
        derivedStateOf {
            species.isNotBlank() &&
                    collectorId.isNotBlank() &&
                    latitude.isNotBlank() &&
                    longitude.isNotBlank() &&
                    quantity.isNotBlank() && quantity.toDoubleOrNull() != null &&
                    collectionDate != "Select Collection Date" &&
                    qualityNotes.isNotBlank() &&
                    herbImage.isNotBlank() // Simple check if the text field is not empty
        }
    }

    // --- Date Picker Dialog ---
    val calendar = Calendar.getInstance()
    val datePickerDialog = DatePickerDialog(context,
        { _: DatePicker, year: Int, month: Int, day: Int ->
            collectionDate = "$year-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}"
        },
        calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Herb Data Collection") },
                navigationIcon = {
                    IconButton(onClick = { navController.navigate(route = Screen.Dashboard.route) }) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.padding(paddingValues).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // --- Form Fields ---
            item { OutlinedTextField(value = species, onValueChange = { species = it }, label = { Text("Species") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = collectorId, onValueChange = { collectorId = it }, label = { Text("Collector ID") }, modifier = Modifier.fillMaxWidth()) }
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
            item { OutlinedTextField(value = quantity, onValueChange = { quantity = it }, label = { Text("Quantity") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth()) }
            item { OutlinedButton(onClick = { datePickerDialog.show() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)) { Text(text = collectionDate, modifier = Modifier.padding(vertical = 8.dp)) } }
            item { OutlinedTextField(value = qualityNotes, onValueChange = { qualityNotes = it }, label = { Text("Quality Notes") }, modifier = Modifier.fillMaxWidth().height(120.dp)) }

            // --- MODIFIED: Herb Image as a Text Field ---
            item {
                OutlinedTextField(
                    value = herbImage,
                    onValueChange = { herbImage = it },
                    label = { Text("Herb Image (URL or Identifier)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // --- Submit Button ---
            item {
                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            try {
                                val jwtToken = "JeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ0ZDI0ZjFkLTM1ZmUtNGY1Ni05N2E1LTVjZWJiODEyYThhZCIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJyb2xlIjoiY29sbGVjdG9yIiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOmNvbGxlY3Rpb24iLCJ2aWV3OmNvbGxlY3Rpb24iXSwiaWF0IjoxNzU4MTM5NDc0LCJleHAiOjE3NTgyMjU4NzR9.cU6W-alBpWd-G3yJAuEcxW1NOtFgTWEjvSUHPAnoTT0"
                                val locationJsonString = Json.encodeToString(LocationData(latitude.toDouble(), longitude.toDouble()))

                                val response = client.post("https://unenlightening-lisha-unsurveyable.ngrok-free.app/api/protected/collection-events") {
                                    header(HttpHeaders.Authorization, "Bearer $jwtToken")
                                    setBody(MultiPartFormDataContent(formData {
                                        append("species", species)
                                        append("collectorId", collectorId)
                                        append("gpsCoordinates", locationJsonString)
                                        append("quantity", quantity)
                                        append("collectionDate", collectionDate)
                                        append("qualityNotes", qualityNotes)
                                        // MODIFIED: Sending herbImage as plain text
                                        append("herbImage", herbImage)
                                    }))
                                }

                                if (response.status.isSuccess()) {
                                    Toast.makeText(context, "Data submitted successfully!", Toast.LENGTH_LONG).show()
                                    navController.popBackStack()
                                } else {
                                    val errorBody = response.body<String>()
                                    android.util.Log.e("DataCollection", "Error ${response.status.value}: $errorBody")
                                    Toast.makeText(context, "Error: ${response.status.value}", Toast.LENGTH_LONG).show()
                                }
                            } catch (e: Exception) {
                                android.util.Log.e("DataCollection", "Submission failed", e)
                                Toast.makeText(context, "Submission failed: Check connection", Toast.LENGTH_LONG).show()
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