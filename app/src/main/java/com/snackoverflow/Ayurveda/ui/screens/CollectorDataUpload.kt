import android.app.DatePickerDialog
import android.widget.DatePicker
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.snackoverflow.Ayurveda.ui.navigation.Screen
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

    // *** NEW: Validation Logic ***
    // This derived state checks if all fields are filled.
    // The button's 'enabled' state will depend on this value.
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
                    // Check against the initial placeholder text
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

            // Input fields for GPS Coordinates
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = latitude,
                        onValueChange = { latitude = it },
                        label = { Text("Latitude") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = longitude,
                        onValueChange = { longitude = it },
                        label = { Text("Longitude") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
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
                    modifier = Modifier.fillMaxWidth().height(120.dp)
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
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    // *** MODIFIED PART ***
                    // The button is only enabled when isFormValid is true
                    enabled = isFormValid
                ) {
                    Text("Submit Data")
                }
            }
        }
    }
}