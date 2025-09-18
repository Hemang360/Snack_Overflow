import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.snackoverflow.Ayurveda.AuthService
import com.snackoverflow.Ayurveda.LoginRequest
import com.snackoverflow.Ayurveda.R
import com.snackoverflow.Ayurveda.ui.navigation.Screen
import io.ktor.http.isSuccess
import kotlinx.coroutines.launch

// Font and Theme definitions are unchanged...
val KalniaFontFamily = FontFamily(
    Font(R.font.kalnia_thin, FontWeight.Thin),
    Font(R.font.kalnia_extralight, FontWeight.ExtraLight),
    Font(R.font.kalnia_light, FontWeight.Light),
    Font(R.font.kalnia_regular, FontWeight.Normal),
    Font(R.font.kalnia_medium, FontWeight.Medium),
    Font(R.font.kalnia_semibold, FontWeight.SemiBold),
    Font(R.font.kalnia_bold, FontWeight.Bold)
)

val GolosTextFontFamily = FontFamily(
    Font(R.font.golos_text_regular, FontWeight.Normal),
    Font(R.font.golos_text_medium, FontWeight.Medium),
    Font(R.font.golos_text_semibold, FontWeight.SemiBold),
    Font(R.font.golos_text_bold, FontWeight.Bold),
    Font(R.font.golos_text_extrabold, FontWeight.ExtraBold),
    Font(R.font.golos_text_black, FontWeight.Black)
)

val LoginTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = KalniaFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = GolosTextFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.5.sp
    ),
    labelMedium = TextStyle(
        fontFamily = GolosTextFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)

val LightGreen = Color(0xFFC0E1BB)
val DarkGreen = Color(0xFF1F261D)

private val LoginColorScheme = lightColorScheme(
    primary = DarkGreen,
    onPrimary = LightGreen,
    background = LightGreen,
    surface = LightGreen,
    onBackground = DarkGreen,
    onSurface = DarkGreen,
    onSurfaceVariant = DarkGreen.copy(alpha = 0.6f)
)

@Composable
fun LoginScreenTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LoginColorScheme,
        typography = LoginTypography,
        content = content
    )
}

@Composable
fun LoginScreen(navController: NavController) {
    // State holders
    var username by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var isPasswordVisible by rememberSaveable { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center
        ) {
            // Removed the Image composable for 'login_backdrop_top'

            // Form content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 32.dp), // Adjusted vertical padding as there's no top image
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Spacer(Modifier.height(32.dp))
                Text(
                    text = "Welcome!",
                    style = MaterialTheme.typography.headlineMedium
                )
                Text(
                    text = "Log in to your account",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Username input field
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    singleLine = true,
                    enabled = !isLoading // Disable when loading
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Password input field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                            Icon(
                                imageVector = Icons.Filled.Lock,
                                contentDescription = if (isPasswordVisible) "Hide password" else "Show password"
                            )
                        }
                    },
                    enabled = !isLoading // Disable when loading
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Login button
                Button(
                    onClick = {
                        isLoading = true
                        coroutineScope.launch {
                            try {
                                val loginRequest = LoginRequest(username, password)
                                val response = AuthService.loginUser(loginRequest)

                                if (response.status.isSuccess()) {
                                    Log.d("LoginScreen", "Login successful!")
                                    navController.navigate(Screen.Dashboard.route)
                                } else {
                                    Log.e("LoginScreen", "Login failed with status: ${response.status}")
                                    // TODO: Show a Snackbar or Toast with an error message
                                }
                            } catch (e: Exception) {
                                Log.e("LoginScreen", "An error occurred during login", e)
                                // TODO: Show an error for network issues
                            } finally {
                                isLoading = false // Ensure loading is stopped
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    enabled = !isLoading // Disable button while loading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(text = "LOGIN", modifier = Modifier.padding(vertical = 8.dp))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Sign up option
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Don't have an account?",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    TextButton(onClick = {
                        navController.navigate(route = Screen.Register.route)
                    }) {
                        Text(
                            text = "Sign Up",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    LoginScreenTheme {
        // Since NavController is required, we can't directly preview LoginScreen without mocking it.
        // For a simple preview, you might create a wrapper Composable that provides a dummy NavController
        // or just preview the individual components within LoginScreen.
        // For now, leaving it commented out as per the original code.
        // LoginScreen(navController = rememberNavController())
    }
}