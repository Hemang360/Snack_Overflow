package com.snackoverflow.Ayurveda

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
    private const val BASE_URL = "https://4fefd4396559.ngrok-free.app"

    suspend fun loginUser(request: LoginRequest): HttpResponse {
        return client.post("$BASE_URL/auth/login") {      // updated endpoint
            contentType(ContentType.Application.Json)
            setBody(mapOf(
                "email" to request.username,          // using email instead of userId
                "password" to request.password         // now sending password too
            ))
        }
    }


    /**
     * Unified register function - decides which onboarding API to call
     */
    suspend fun registerUser(request: RegisterRequest): HttpResponse {
        return when (request.organizationType.lowercase()) {
            "farmer", "collector" -> {   // <-- handle collector as farmer
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