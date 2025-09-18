package com.snackoverflow.Ayurveda

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val fullName: String,
    val organizationType: String
)

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

    private const val BASE_URL = "https://unenlightening-lisha-unsurveyable.ngrok-free.app"

    suspend fun loginUser(loginRequest: LoginRequest): HttpResponse {
        return client.post("$BASE_URL/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(loginRequest)
        }
    }

    suspend fun registerUser(registerRequest: RegisterRequest): HttpResponse {
        return client.post("$BASE_URL/api/auth/register") {
            contentType(ContentType.Application.Json)
            setBody(registerRequest)
        }
    }
}