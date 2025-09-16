package com.snackoverflow.Ayurveda.viewmodel

// SharedRecordViewModel.kt

import androidx.lifecycle.ViewModel
import com.snackoverflow.Ayurveda.ui.screens.HerbBatchRecord
import com.snackoverflow.Ayurveda.ui.screens.LabResult
import com.snackoverflow.Ayurveda.ui.screens.MedicalRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

// A data class to hold all the state in one place
data class RecordScreenUiState(
    val herbBatchRecord: HerbBatchRecord? = null,
    val medicalRecord: MedicalRecord? = null,
    val labResult: LabResult? = null
)

class SharedRecordViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(RecordScreenUiState())
    val uiState = _uiState.asStateFlow()

    // Function to be called from the source screen before navigating
    fun selectRecordData(
        herbBatch: HerbBatchRecord,
        medicalRecord: MedicalRecord,
        labResult: LabResult
    ) {
        _uiState.update { currentState ->
            currentState.copy(
                herbBatchRecord = herbBatch,
                medicalRecord = medicalRecord,
                labResult = labResult
            )
        }
    }
}