// AuthService.kt

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

object AuthService {
    private val client = HttpClient(CIO) {
        // Configure JSON serialization
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
}