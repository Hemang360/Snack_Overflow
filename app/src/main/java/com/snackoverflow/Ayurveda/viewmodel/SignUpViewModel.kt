package com.snackoverflow.Ayurveda.viewmodels // Or your updated package name

import android.util.Log // <-- Import the Log class
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.snackoverflow.Ayurveda.AuthService
import com.snackoverflow.Ayurveda.RegisterRequest
import io.ktor.client.call.*
import io.ktor.http.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

// Error response data class
@Serializable
data class ErrorResponse(
    val success: Boolean,
    val statusCode: Int,
    val message: String
)

// RegistrationState sealed interface remains the same...
sealed interface RegistrationState {
    object Idle : RegistrationState
    object Loading : RegistrationState
    object Success : RegistrationState
    data class Error(val message: String) : RegistrationState
}


class SignUpViewModel : ViewModel() {

    // Define a TAG for filtering logs in Logcat
    private val TAG = "SignUpViewModel"

    private val _registrationState = MutableStateFlow<RegistrationState>(RegistrationState.Idle)
    val registrationState = _registrationState.asStateFlow()

    fun register(registerRequest: RegisterRequest) {
        // Log the initial call
        Log.d(TAG, "register function called for username: ${registerRequest.username}")

        viewModelScope.launch {
            _registrationState.value = RegistrationState.Loading
            Log.i(TAG, "State set to Loading. Attempting API call...")

            try {
                val response = AuthService.registerUser(registerRequest)

                if (response.status.isSuccess()) {
                    // Log the success case
                    Log.i(TAG, "API call successful! Status: ${response.status}")
                    _registrationState.value = RegistrationState.Success
                } else {
                    val errorBody: String = response.body()
                    // Log the server error case
                    Log.w(TAG, "API call failed with status: ${response.status}. Error: $errorBody")
                    
                    // Try to parse the error response to extract just the message
                    try {
                        val errorResponse = Json.decodeFromString<ErrorResponse>(errorBody)
                        _registrationState.value = RegistrationState.Error(errorResponse.message)
                    } catch (e: Exception) {
                        // If parsing fails, fall back to showing the full error
                        Log.e(TAG, "Failed to parse error response", e)
                        _registrationState.value = RegistrationState.Error("Registration failed: ${response.status.description}")
                    }
                }
            } catch (e: Exception) {
                // Log any exceptions
                Log.e(TAG, "An exception occurred during registration.", e)
                _registrationState.value = RegistrationState.Error(e.message ?: "An unknown error occurred")
            }
        }
    }
}