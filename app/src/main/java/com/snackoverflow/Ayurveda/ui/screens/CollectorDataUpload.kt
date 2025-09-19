// REQUIRED IMPORTS
import android.Manifest
import android.app.DatePickerDialog
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.OpenableColumns
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource // <-- ADDED IMPORT
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.snackoverflow.Ayurveda.R // <-- ADDED IMPORT (Ensure this path is correct for your project)
import com.snackoverflow.Ayurveda.ui.navigation.Screen
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
import java.io.File
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

// --- Helper function to create a temporary URI for the camera ---
private fun createImageUri(context: Context): Uri {
    val imageFile = File.createTempFile(
        "camera_photo_",
        ".jpg",
        context.cacheDir
    )
    return FileProvider.getUriForFile(
        context,
        "${context.packageName}.provider",
        imageFile
    )
}

// --- Helper function to get file name from URI ---
private fun getFileName(context: Context, uri: Uri): String? {
    var fileName: String? = null
    if (uri.scheme == "content") {
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1) {
                    fileName = it.getString(nameIndex)
                }
            }
        }
    }
    if (fileName == null) {
        fileName = uri.path
        val cut = fileName?.lastIndexOf('/')
        if (cut != -1) {
            fileName = fileName?.substring(cut!! + 1)
        }
    }
    return fileName
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
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var showImageSourceDialog by remember { mutableStateOf(false) }
    var showQrCodeDialog by remember { mutableStateOf(false) } // <-- NEW: State for QR dialog

    // --- Context and Scopes ---
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // --- Ktor HTTP Client ---
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

    // --- ActivityResultLaunchers for gallery and camera ---
    var tempCameraUri by remember { mutableStateOf<Uri?>(null) }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        imageUri = uri
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success: Boolean ->
        if (success) {
            imageUri = tempCameraUri
        }
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            val newUri = createImageUri(context)
            tempCameraUri = newUri
            cameraLauncher.launch(newUri)
        } else {
            Toast.makeText(context, "Camera permission denied", Toast.LENGTH_SHORT).show()
        }
    }


    // --- Form Validation ---
    val isFormValid by remember(species, collectorId, latitude, longitude, quantity, collectionDate, qualityNotes, imageUri) {
        derivedStateOf {
            species.isNotBlank() &&
                    collectorId.isNotBlank() &&
                    latitude.isNotBlank() &&
                    longitude.isNotBlank() &&
                    quantity.isNotBlank() && quantity.toDoubleOrNull() != null &&
                    collectionDate != "Select Collection Date" &&
                    qualityNotes.isNotBlank() &&
                    imageUri != null
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

    // --- Dialog to choose image source ---
    if (showImageSourceDialog) {
        AlertDialog(
            onDismissRequest = { showImageSourceDialog = false },
            title = { Text("Choose Image Source") },
            text = { Text("Select a picture from the gallery or take a new one with your camera.") },
            confirmButton = {
                TextButton(onClick = {
                    showImageSourceDialog = false
                    imagePickerLauncher.launch("image/*")
                }) {
                    Text("Gallery")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showImageSourceDialog = false
                    when (PackageManager.PERMISSION_GRANTED) {
                        ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) -> {
                            val newUri = createImageUri(context)
                            tempCameraUri = newUri
                            cameraLauncher.launch(newUri)
                        }
                        else -> {
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    }
                }) {
                    Text("Camera")
                }
            }
        )
    }

    // --- NEW: Dialog to show QR Code on success ---
    if (showQrCodeDialog) {
        AlertDialog(
            onDismissRequest = {
                showQrCodeDialog = false
                navController.popBackStack()
            },
            title = { Text("Submission Successful!") },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Make sure you have an image named 'qr.png' in your res/drawable folder
                    Image(
                        painter = painterResource(id = R.drawable.qr),
                        contentDescription = "Collection Event QR Code"
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    showQrCodeDialog = false
                    navController.popBackStack()
                }) {
                    Text("Done")
                }
            }
        )
    }


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
            item { OutlinedTextField(value = collectorId, onValueChange = { collectorId = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth()) }
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

            // --- Image picker and preview section ---
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    imageUri?.let {
                        Text("Image Preview:", style = MaterialTheme.typography.bodyLarge)
                        Image(
                            painter = rememberAsyncImagePainter(model = it),
                            contentDescription = "Selected Herb Image",
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Button(onClick = { showImageSourceDialog = true }) {
                        Text(if (imageUri == null) "Select Herb Image" else "Change Herb Image")
                    }
                }
            }


            // --- Submit Button ---
            item {
                Button(
                    onClick = {
                        val currentImageUri = imageUri ?: return@Button

                        scope.launch {
                            isLoading = true
                            try {
                                val imageFileName = getFileName(context, currentImageUri) ?: "unknown_image.jpg"

                                val jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlMzM3MzNmLTQ3NWMtNDE4MS1iYmVhLThlOTVmMmE2MDE3YyIsInVzZXJuYW1lIjoieG9ueW5peCIsInJvbGUiOiJjb2xsZWN0b3IiLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6Y29sbGVjdGlvbiIsInZpZXc6Y29sbGVjdGlvbiJdLCJpYXQiOjE3NTgxOTA1MjYsImV4cCI6MTc1ODI3NjkyNn0.1g1oiGEY16uTjghODAEdxk73cCc1NGsb7362Hv37LjA"
                                val locationJsonString = Json.encodeToString(LocationData(latitude.toDouble(), longitude.toDouble()))

                                val dataSubmitResponse = client.post("https://unenlightening-lisha-unsurveyable.ngrok-free.app/api/protected/collection-events") {
                                    header(HttpHeaders.Authorization, "Bearer $jwtToken")
                                    setBody(MultiPartFormDataContent(formData {
                                        append("species", species)
                                        append("collectorId", collectorId)
                                        append("gpsCoordinates", locationJsonString)
                                        append("quantity", quantity)
                                        append("collectionDate", collectionDate)
                                        append("qualityNotes", qualityNotes)
                                        append("herbImage", imageFileName)
                                    }))
                                }

                                if (dataSubmitResponse.status.isSuccess()) {
                                    // --- MODIFIED: Show QR code dialog on success ---
                                    showQrCodeDialog = true
                                } else {
                                    val errorBody = dataSubmitResponse.body<String>()
                                    android.util.Log.e("DataCollection", "Error ${dataSubmitResponse.status.value}: $errorBody")
                                    Toast.makeText(context, "Error: ${dataSubmitResponse.status.value}", Toast.LENGTH_LONG).show()
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