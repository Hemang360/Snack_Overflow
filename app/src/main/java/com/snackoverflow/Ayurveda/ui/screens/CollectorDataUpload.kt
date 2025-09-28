// REQUIRED IMPORTS
import android.Manifest
import android.app.DatePickerDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
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
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import coil.compose.rememberAsyncImagePainter
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.snackoverflow.Ayurveda.TokenManager
import com.snackoverflow.Ayurveda.R // <-- Ensure this path is correct for your project
import com.snackoverflow.Ayurveda.ui.navigation.Screen // <-- Ensure this path is correct
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage
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
import java.io.File
import java.io.FileOutputStream
import java.util.Calendar
import java.util.UUID

// --- Data classes for request and response ---
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
    val quantity: Double,
    val unit: String,
    val gpsCoordinates: GPSCoordinates,
    val collectorId: String,
    val cultivationMethod: String,
    val harvestMethod: String,
    val plantPart: String,
    val images: List<String>
)

@Serializable
data class HerbBatchResponse(
    val message: String,
    val batchId: String
)

// Response structure based on the API logs
@Serializable
data class BundleResponse(
    val resourceType: String,
    val id: String,
    val entry: List<Entry>
)

@Serializable
data class Entry(
    val resource: Resource
)

@Serializable
data class Resource(
    val resourceType: String,
    val id: String,
    val identifier: List<Identifier>? = null
)

@Serializable
data class Identifier(
    val value: String
)

// --- Helper Functions ---
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

private fun createImageUri(context: Context): Uri {
    val imageFile = File.createTempFile(
        "collector_photo_",
        ".jpg",
        context.cacheDir
    )
    return FileProvider.getUriForFile(
        context,
        "${context.packageName}.provider",
        imageFile
    )
}

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
        uri.path?.let { path ->
            val cut = path.lastIndexOf('/')
            fileName = if (cut != -1) {
                path.substring(cut + 1)
            } else {
                path
            }
        }
    }
    return fileName
}

private fun generateQrCodeBitmap(text: String): Bitmap? {
    if (text.isBlank()) return null
    return try {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 512, 512)
        val width = bitMatrix.width
        val height = bitMatrix.height
        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
        for (x in 0 until width) {
            for (y in 0 until height) {
                bmp.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        bmp
    } catch (e: Exception) {
        android.util.Log.e("QrGenerator", "Failed to generate QR code bitmap", e)
        null
    }
}

private fun shareQrCode(context: Context, bitmap: Bitmap) {
    try {
        val cachePath = File(context.cacheDir, "images")
        cachePath.mkdirs()
        val file = File(cachePath, "qr_code_to_share.png")
        val fileOutputStream = FileOutputStream(file)
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream)
        fileOutputStream.close()

        val imageUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_STREAM, imageUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Share QR Code via"))

    } catch (e: Exception) {
        Toast.makeText(context, "Failed to share QR code.", Toast.LENGTH_SHORT).show()
        android.util.Log.e("ShareQrCode", "Error sharing QR code", e)
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

    // --- Image handling state ---
    var collectorImageUri by remember { mutableStateOf<Uri?>(null) }
    var showImageSourceDialog by remember { mutableStateOf(false) }

    var isLoading by remember { mutableStateOf(false) }
    var showQrCodeDialog by remember { mutableStateOf(false) }
    var generatedQrCodeBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var generatedBatchId by remember { mutableStateOf<String?>(null) }


    // --- Context and Scopes ---
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tokenManager = remember { TokenManager(context) }

    // --- Ktor HTTP Client for your backend ---
    val client = remember { HttpClient(CIO) { install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) } } }

    // --- Supabase Client for image storage ---
    val supabase = remember {
        createSupabaseClient(
            supabaseUrl = "https://plgikesmsrshyeflevnd.supabase.co",
            supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ2lrZXNtc3JzaHllZmxldm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTA1MTgsImV4cCI6MjA3Mzk2NjUxOH0.RrjV-MgiaRqV_328zUsX_djCxjKGvvCe_pjBlgGk_bM"
        ) {
            install(Storage)
        }
    }

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

    // --- Image picker launchers ---
    var tempCameraUri by remember { mutableStateOf<Uri?>(null) }
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        collectorImageUri = uri
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success: Boolean ->
        if (success) {
            collectorImageUri = tempCameraUri
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
    val isFormValid by remember(
        herbName, scientificName, collectorId, collectorImageUri, latitude, longitude, quantity,
        unit, harvestDate, farmLocation, cultivationMethod, harvestMethod, plantPart
    ) {
        derivedStateOf {
            herbName.isNotBlank() &&
                    scientificName.isNotBlank() &&
                    collectorId.isNotBlank() &&
                    collectorImageUri != null &&
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

    // --- Image Source Dialog ---
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
                    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        val newUri = createImageUri(context)
                        tempCameraUri = newUri
                        cameraLauncher.launch(newUri)
                    } else {
                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                    }
                }) {
                    Text("Camera")
                }
            }
        )
    }

    // --- QR Code Dialog ---
    if (showQrCodeDialog) {
        AlertDialog(
            onDismissRequest = {
                showQrCodeDialog = false
                generatedQrCodeBitmap = null // Clear the bitmap state
                generatedBatchId = null // Clear the batch ID state
                navController.popBackStack()
            },
            title = { Text("Submission Successful!") },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    generatedQrCodeBitmap?.let { bmp ->
                        Image(
                            bitmap = bmp.asImageBitmap(),
                            contentDescription = "Generated QR Code for Batch ID"
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        generatedBatchId?.let { batchId ->
                            Text(
                                text = "Batch ID: $batchId",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    } ?: Text("Generating QR Code...")
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    showQrCodeDialog = false
                    generatedQrCodeBitmap = null // Clear the bitmap state
                    generatedBatchId = null // Clear the batch ID state
                    navController.popBackStack()
                }) {
                    Text("Done")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    generatedQrCodeBitmap?.let { bmp ->
                        shareQrCode(context, bmp)
                    }
                }) {
                    Text("Share")
                }
            }
        )
    }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Herb Data Collection") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.padding(paddingValues).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // --- Form Fields ---
            item { OutlinedTextField(value = herbName, onValueChange = { herbName = it }, label = { Text("Herb Name") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = scientificName, onValueChange = { scientificName = it }, label = { Text("Scientific Name") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = collectorId, onValueChange = { collectorId = it }, label = { Text("Farmer's Name") }, modifier = Modifier.fillMaxWidth()) }
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Herb Photo",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.align(Alignment.Start)
                    )

                    collectorImageUri?.let { uri ->
                        Image(
                            painter = rememberAsyncImagePainter(model = uri),
                            contentDescription = "Herb Photo",
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentScale = ContentScale.Crop
                        )
                    }

                    Button(
                        onClick = { showImageSourceDialog = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "Camera",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (collectorImageUri == null) "Take/Select Photo" else "Change Photo")
                    }
                }
            }
            item { OutlinedTextField(value = farmLocation, onValueChange = { farmLocation = it }, label = { Text("Farm Location") }, modifier = Modifier.fillMaxWidth()) }

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

            item { OutlinedButton(onClick = { datePickerDialog.show() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)) { Text(text = harvestDate, modifier = Modifier.padding(vertical = 8.dp)) } }
            item { OutlinedTextField(value = cultivationMethod, onValueChange = { cultivationMethod = it }, label = { Text("Cultivation Method") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = harvestMethod, onValueChange = { harvestMethod = it }, label = { Text("Harvest Method") }, modifier = Modifier.fillMaxWidth()) }
            item { OutlinedTextField(value = plantPart, onValueChange = { plantPart = it }, label = { Text("Plant Part Used") }, modifier = Modifier.fillMaxWidth()) }


            // --- Submit Button ---
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            try {
                                val currentImageUri = collectorImageUri ?: return@launch

                                val fileBytes = context.contentResolver.openInputStream(currentImageUri)?.use { it.readBytes() }
                                if (fileBytes == null) {
                                    Toast.makeText(context, "Could not read image file.", Toast.LENGTH_SHORT).show()
                                    isLoading = false
                                    return@launch
                                }

                                val path = "herb_photos/${UUID.randomUUID()}.jpg"
                                supabase.storage["herb_images"].upload(path, fileBytes)
                                val uploadedImageUrl = supabase.storage["herb_images"].publicUrl(path)

                                val jwtToken = tokenManager.getToken()
                                if (jwtToken == null) {
                                    Toast.makeText(context, "No authentication token found. Please login again.", Toast.LENGTH_LONG).show()
                                    isLoading = false
                                    return@launch
                                }
                                
                                // Log user information for debugging
                                val userId = tokenManager.getUserId()
                                val userEmail = tokenManager.getUserEmail()
                                val userRole = tokenManager.getUserRole()
                                android.util.Log.d("DataCollection", "Submitting data as User ID: $userId, Email: $userEmail, Role: $userRole")

                                val herbBatchRequest = HerbBatchRequest(
                                    batchId = "BATCH-${System.currentTimeMillis()}",
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
                                    plantPart = plantPart,
                                    images = listOf(uploadedImageUrl)
                                )

                                val response = client.post("http://3.27.15.114:5000/createHerbBatch") {
                                    header(HttpHeaders.Authorization, "Bearer $jwtToken")
                                    contentType(ContentType.Application.Json)
                                    setBody(herbBatchRequest)
                                }

                                if (response.status.isSuccess()) {
                                    val responseBody = response.body<String>()
                                    android.util.Log.d("DataCollection", "API Response: $responseBody")
                                    
                                    // Try to parse as BundleResponse first (new format)
                                    val batchId = try {
                                        val bundleResponse = Json.decodeFromString<BundleResponse>(responseBody)
                                        // Extract batch ID from entry[0].resource.id or entry[0].resource.identifier[0].value
                                        val firstEntry = bundleResponse.entry.firstOrNull()
                                        if (firstEntry != null) {
                                            val resourceId = firstEntry.resource.id
                                            val identifierValue = firstEntry.resource.identifier?.firstOrNull()?.value
                                            resourceId.ifEmpty { identifierValue ?: "" }
                                        } else {
                                            bundleResponse.id // Fallback to top-level id
                                        }
                                    } catch (e: Exception) {
                                        android.util.Log.d("DataCollection", "Failed to parse as BundleResponse, trying HerbBatchResponse: ${e.message}")
                                        // Fallback to old format
                                        try {
                                            val herbBatchResponse = Json.decodeFromString<HerbBatchResponse>(responseBody)
                                            herbBatchResponse.batchId
                                        } catch (e2: Exception) {
                                            android.util.Log.e("DataCollection", "Failed to parse response: ${e2.message}")
                                            "BATCH-${System.currentTimeMillis()}" // Fallback batch ID
                                        }
                                    }
                                    
                                    android.util.Log.d("DataCollection", "Extracted Batch ID: $batchId")
                                    generatedBatchId = batchId
                                    generatedQrCodeBitmap = generateQrCodeBitmap(batchId)
                                    showQrCodeDialog = true
                                } else {
                                    val errorBody = response.body<String>()
                                    android.util.Log.e("DataCollection", "API Error ${response.status.value}: $errorBody")
                                    android.util.Log.e("DataCollection", "Response headers: ${response.headers}")

                                    if (response.status.value == 401 || errorBody.contains("token", ignoreCase = true)) {
                                        Toast.makeText(context, "Authentication failed. Please login again.", Toast.LENGTH_LONG).show()
                                        tokenManager.clearUserSession()
                                        // Navigate back to login screen
                                        navController.navigate(Screen.Login.route) {
                                            popUpTo(0) { inclusive = true }
                                        }
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

@Preview(showBackground = true)
@Composable
fun DataCollectionScreenPreview(){
    DataCollectionScreen(navController = rememberNavController())
}