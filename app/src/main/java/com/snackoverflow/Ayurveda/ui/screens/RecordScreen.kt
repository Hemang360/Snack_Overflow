package com.snackoverflow.Ayurveda.ui.screens

import DarkGreen
import LightGreen
import LoginTypography
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.intellij.lang.annotations.JdkConstants

data class HerbBatchRecord(
    val herbBatchId: String,
    val name: String,
    val dob: String,
    val city: String,
    val authorizedCollectors: List<String>
)

data class MedicalRecord(
    val recordId: String,
    val herbBatchId: String,
    val collectorId: String,
    val diagnosis: String,
    val prescription: String,
    val timestamp: String
)

data class LabResult(
    val labResultId: String,
    val herbBatchId: String,
    val labAgentId: String,
    val testType: String,
    val testResults: String,
    val notes: String,
    val timestamp: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecordScreen(
    herbBatchRecord: HerbBatchRecord,
    medicalRecord: MedicalRecord,
    labResult: LabResult
) {
    // Apply the custom theme colors and typography
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = DarkGreen,
            onPrimary = LightGreen,
            background = LightGreen,
            surface = LightGreen,
            onBackground = DarkGreen,
            onSurface = DarkGreen,
            onSurfaceVariant = DarkGreen.copy(alpha = 0.6f)
        ),
        typography = LoginTypography
    ) {
        Scaffold(
            topBar = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {/*TODO : Handle App Navigation*/}
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Go Back to Home Page",
                            modifier = Modifier.size(28.dp)
                        )
                    }
                    TopAppBar(
                        title = {
                            Text(
                                "Herb Batch Record",
                                style = MaterialTheme.typography.displayLarge.copy(fontSize = 28.sp)
                            )
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = MaterialTheme.colorScheme.background,
                            titleContentColor = MaterialTheme.colorScheme.onBackground
                        )
                    )
                }
            },
            containerColor = MaterialTheme.colorScheme.background
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    HerbBatchRecordCard(record = herbBatchRecord)
                }
                item {
                    MedicalRecordCard(record = medicalRecord)
                }
                item {
                    LabResultCard(result = labResult)
                }
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
fun HerbBatchRecordCard(record: HerbBatchRecord) {
    InfoCard(title = "Patient Details") {
        InfoRow(label = "Batch ID", value = record.herbBatchId)
        InfoRow(label = "Name", value = record.name)
        InfoRow(label = "Date of Birth", value = record.dob)
        InfoRow(label = "City", value = record.city)
        InfoRow(label = "Authorized Collectors", value = record.authorizedCollectors.joinToString())
    }
}

@Composable
fun MedicalRecordCard(record: MedicalRecord) {
    InfoCard(title = "Medical Record") {
        InfoRow(label = "Record ID", value = record.recordId)
        InfoRow(label = "Collector ID", value = record.collectorId)
        InfoRow(label = "Diagnosis", value = record.diagnosis)
        InfoRow(label = "Prescription", value = record.prescription)
        InfoRow(label = "Timestamp", value = record.timestamp)
    }
}

@Composable
fun LabResultCard(result: LabResult) {
    InfoCard(title = "Lab Result") {
        InfoRow(label = "Result ID", value = result.labResultId)
        InfoRow(label = "Lab Agent ID", value = result.labAgentId)
        InfoRow(label = "Test Type", value = result.testType)
        InfoRow(label = "Test Results", value = result.testResults)
        InfoRow(label = "Notes", value = result.notes)
        InfoRow(label = "Timestamp", value = result.timestamp)
    }
}

// Reusable composable for the overall card structure
@Composable
fun InfoCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            Divider(color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f))
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

// Reusable composable for a label-value row
@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.weight(0.4f), // Allocate 40% of the width to the label
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(0.6f), // Allocate 60% of the width to the value
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
        )
    }
}


@Preview(showBackground = true)
@Composable
fun RecordScreenPreview() {
    // Sample data for the preview
    val herbBatchRecord = HerbBatchRecord(
        herbBatchId = "HB-001",
        name = "John Doe",
        dob = "1990-01-01",
        city = "New York",
        authorizedCollectors = listOf("Collector-001")
    )
    val medicalRecord = MedicalRecord(
        recordId = "R-txid123",
        herbBatchId = "HB-001",
        collectorId = "Collector-001",
        diagnosis = "Hypertension",
        prescription = "Lisinopril 10mg daily",
        timestamp = "2024-01-01T10:00:00Z"
    )
    val labResult = LabResult(
        labResultId = "LAB-txid456",
        herbBatchId = "HB-001",
        labAgentId = "LabAgent-001",
        testType = "Blood Pressure",
        testResults = "140/90 mmHg",
        notes = "Elevated reading",
        timestamp = "2024-01-01T11:00:00Z"
    )

    RecordScreen(
        herbBatchRecord = herbBatchRecord,
        medicalRecord = medicalRecord,
        labResult = labResult
    )
}