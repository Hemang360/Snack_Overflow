package com.snackoverflow.Ayurveda

import android.util.Log
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import io.ktor.client.statement.*

// ---------- Request Models ----------
@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class LoginResponse(
    val success: Boolean,
    val token: String?, // JWT access token
    val message: String,
    val userId: String? = null,
    val email: String? = null,
    val role: String? = null
)

@Serializable
data class LoginApiResponse(
    val success: Boolean,
    val statusCode: Int,
    val message: String,
    val data: LoginData? = null
)

@Serializable
data class LoginData(
    val userId: String,
    val email: String,
    val role: String,
    val accessToken: String,
    val refreshToken: String,
    val profile: UserProfile? = null
)

@Serializable
data class UserProfile(
    val name: String,
    val farmLocation: String,
    val contact: String = "",
    val certifications: List<String> = emptyList(),
    val documentCids: List<String> = emptyList()
)

@Serializable
data class RegisterRequest( // what your SignUpScreen creates
    val username: String,
    val email: String,
    val password: String,
    val fullName: String,
    val organizationType: String
)

@Serializable
data class FarmerRegisterRequest(
    val email: String,
    val password: String,
    val confirmPassword: String,
    val name: String,
    val farmLocation: String
)

@Serializable
data class ManufacturerRegisterRequest(
    val userId: String,
    val manufacturerId: String,
    val companyName: String,
    val name: String,
    val location: String
)

@Serializable
data class LaboratoryRegisterRequest(
    val userId: String,
    val laboratoryId: String,
    val labName: String,
    val location: String,
    val accreditation: String,
    val certifications: List<String>
)

// ---------- AuthService ----------
object AuthService {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            })
        }
    }

    // adjust IP for emulator/physical device
    private const val BASE_URL = "http://3.27.15.114:5000"

    suspend fun loginUser(request: LoginRequest): LoginResponse {
        val response = client.post("$BASE_URL/auth/login") {      // updated endpoint
            contentType(ContentType.Application.Json)
            setBody(mapOf(
                "email" to request.username,          // using email instead of userId
                "password" to request.password         // now sending password too
            ))
        }
        
        return if (response.status.isSuccess()) {
            try {
                val responseBody = response.body<String>()
                Log.d("AuthService", "Login response body: $responseBody")
                Log.d("AuthService", "Response status: ${response.status}")
                Log.d("AuthService", "Response headers: ${response.headers}")
                
                // Parse the JSON response to extract the JWT access token from nested data
                val jsonResponse = Json.decodeFromString<LoginApiResponse>(responseBody)
                
                if (jsonResponse.success && jsonResponse.data != null) {
                    val jwtToken = jsonResponse.data.accessToken
                    Log.d("AuthService", "Extracted JWT token: ${jwtToken.take(50)}...")
                    Log.d("AuthService", "JWT token starts with 'eyJ': ${jwtToken.startsWith("eyJ")}")
                    Log.d("AuthService", "User ID: ${jsonResponse.data.userId}")
                    Log.d("AuthService", "User Role: ${jsonResponse.data.role}")
                    Log.d("AuthService", "User Email: ${jsonResponse.data.email}")
                    
                    LoginResponse(
                        success = true,
                        token = jwtToken,
                        message = jsonResponse.message,
                        userId = jsonResponse.data.userId,
                        email = jsonResponse.data.email,
                        role = jsonResponse.data.role
                    )
                } else {
                    Log.e("AuthService", "Login failed - success: ${jsonResponse.success}, data: ${jsonResponse.data}")
                    LoginResponse(
                        success = false,
                        token = null,
                        message = jsonResponse.message ?: "Login failed"
                    )
                }
            } catch (e: Exception) {
                Log.e("AuthService", "Error parsing login response", e)
                LoginResponse(
                    success = false,
                    token = null,
                    message = "Failed to parse login response: ${e.message}"
                )
            }
        } else {
            val errorBody = response.body<String>()
            Log.e("AuthService", "Login failed: ${response.status} - $errorBody")
            Log.e("AuthService", "Response headers: ${response.headers}")
            LoginResponse(
                success = false,
                token = null,
                message = "Login failed: ${response.status.description} - $errorBody"
            )
        }
    }


    /**
     * Unified register function - decides which onboarding API to call
     */
    suspend fun registerUser(request: RegisterRequest): HttpResponse {
        return when (request.organizationType.lowercase()) {
            "farmer", "consumer" -> {   // <-- handle collector as farmer
                val farmerReq = FarmerRegisterRequest(
                    email = request.email,
                    password = request.password,
                    confirmPassword = request.password,
                    name = request.fullName,
                    farmLocation = "Bengaluru, Karnataka"
                )
                client.post("$BASE_URL/auth/register/farmer") {
                    contentType(ContentType.Application.Json)
                    setBody(farmerReq)
                }
            }

            "manufacturer" -> {
                val manuReq = ManufacturerRegisterRequest(
                    userId = "Regulator01",
                    manufacturerId = request.username,
                    companyName = "Himalaya Herbal",
                    name = request.fullName,
                    location = "Bengaluru, Karnataka"
                )
                client.post("$BASE_URL/onboardManufacturer") {
                    contentType(ContentType.Application.Json)
                    setBody(manuReq)
                }
            }

            "laboratory", "lab" -> {    // optional: accept "lab" too
                val labReq = LaboratoryRegisterRequest(
                    userId = "LabOverseer01",
                    laboratoryId = request.username,
                    labName = "Quality Testing Lab",
                    location = "Mumbai, Maharashtra",
                    accreditation = "NABL-17025-2024",
                    certifications = listOf("ISO-17025", "AYUSH-QC")
                )
                client.post("$BASE_URL/onboardLaboratory") {
                    contentType(ContentType.Application.Json)
                    setBody(labReq)
                }
            }

            else -> throw IllegalArgumentException("Unsupported organization type: ${request.organizationType}")
        }
    }
}