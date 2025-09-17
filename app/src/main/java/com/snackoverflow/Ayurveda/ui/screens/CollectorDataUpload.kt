// REQUIRED IMPORTS
import android.Manifest
import android.app.DatePickerDialog
import android.content.pm.PackageManager
import android.widget.DatePicker
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.MyLocation // For the location icon
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.snackoverflow.Ayurveda.ui.navigation.Screen // Make sure this path is correct for your project
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataCollectionScreen(navController: NavController) {
    // State Management for each field
    var species by remember { mutableStateOf("") }
    var collectorId by remember { mutableStateOf("") }
    var latitude by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("") }
    var collectionDate by remember { mutableStateOf("Select Collection Date") }
    var qualityNotes by remember { mutableStateOf("") }
    var herbImage by remember { mutableStateOf("") }

    val context = LocalContext.current

    // *** NEW: Location Client and Permission Launcher ***
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { permissions ->
            if (permissions.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false) ||
                permissions.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false)) {
                // Permission Granted: Try to get location again
                fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                    .addOnSuccessListener { location ->
                        if (location != null) {
                            latitude = location.latitude.toString()
                            longitude = location.longitude.toString()
                        }
                    }
            } else {
                // Permission Denied: Handle appropriately (e.g., show a snackbar)
            }
        }
    )

    // Validation Logic
    val isFormValid by remember(
        species,
        collectorId,
        latitude,
        longitude,
        quantity,
        collectionDate,
        qualityNotes,
        herbImage
    ) {
        derivedStateOf {
            species.isNotBlank() &&
                    collectorId.isNotBlank() &&
                    latitude.isNotBlank() &&
                    longitude.isNotBlank() &&
                    quantity.isNotBlank() &&
                    collectionDate != "Select Collection Date" &&
                    qualityNotes.isNotBlank() &&
                    herbImage.isNotBlank()
        }
    }


    // Date Picker Dialog logic
    val calendar = Calendar.getInstance()
    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)

    val datePickerDialog = DatePickerDialog(
        context,
        { _: DatePicker, selectedYear: Int, selectedMonth: Int, dayOfMonth: Int ->
            collectionDate = "$selectedYear-${selectedMonth + 1}-$dayOfMonth"
        }, year, month, day
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { navController.navigate(route = Screen.Dashboard.route) }) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back"
                            )
                        }
                        Text("Herb Data Collection")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Input field for Species
            item {
                OutlinedTextField(
                    value = species,
                    onValueChange = { species = it },
                    label = { Text("Species") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Input field for Collector ID
            item {
                OutlinedTextField(
                    value = collectorId,
                    onValueChange = { collectorId = it },
                    label = { Text("Collector ID") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // *** MODIFIED: GPS Coordinates Section ***
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            // Check if permissions are granted
                            val hasFineLocation = ContextCompat.checkSelfPermission(
                                context, Manifest.permission.ACCESS_FINE_LOCATION
                            ) == PackageManager.PERMISSION_GRANTED
                            val hasCoarseLocation = ContextCompat.checkSelfPermission(
                                context, Manifest.permission.ACCESS_COARSE_LOCATION
                            ) == PackageManager.PERMISSION_GRANTED

                            if (hasFineLocation || hasCoarseLocation) {
                                // Permissions are granted, get the location
                                fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                                    .addOnSuccessListener { location ->
                                        if (location != null) {
                                            latitude = location.latitude.toString()
                                            longitude = location.longitude.toString()
                                        }
                                    }
                            } else {
                                // Permissions are not granted, request them
                                locationPermissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                    )
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(imageVector = Icons.Default.MyLocation, contentDescription = "Get Location", modifier = Modifier.padding(end = 8.dp))
                        Text("Get Current Location")
                    }

                    // Display the fetched coordinates
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = latitude,
                            onValueChange = {}, // Not user-editable
                            readOnly = true,
                            label = { Text("Latitude") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = longitude,
                            onValueChange = {}, // Not user-editable
                            readOnly = true,
                            label = { Text("Longitude") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Input field for Quantity
            item {
                OutlinedTextField(
                    value = quantity,
                    onValueChange = { quantity = it },
                    label = { Text("Quantity") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Button to show Date Picker
            item {
                OutlinedButton(
                    onClick = { datePickerDialog.show() },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = collectionDate, modifier = Modifier.padding(vertical = 8.dp))
                }
            }

            // Input field for Quality Notes
            item {
                OutlinedTextField(
                    value = qualityNotes,
                    onValueChange = { qualityNotes = it },
                    label = { Text("Quality Notes") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                )
            }

            // Input field for Herb Image (as a string)
            item {
                OutlinedTextField(
                    value = herbImage,
                    onValueChange = { herbImage = it },
                    label = { Text("Herb Image (File Path or URL)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Submit Button
            item {
                Button(
                    onClick = { /* TODO: Add data submission logic here */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    enabled = isFormValid
                ) {
                    Text("Submit Data")
                }
            }
        }
    }
}