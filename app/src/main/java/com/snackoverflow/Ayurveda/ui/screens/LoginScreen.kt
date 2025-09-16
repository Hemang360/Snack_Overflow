import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.snackoverflow.Ayurveda.R

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
fun LoginScreen() {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var isPasswordVisible by rememberSaveable { mutableStateOf(false) }
    var selectedRole by rememberSaveable { mutableStateOf<String?>(null) }
    var uniqueId by rememberSaveable { mutableStateOf("") }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            Image(
                painter = painterResource(id = R.drawable.login_backdrop_top),
                contentDescription = "Login backdrop",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.3f)
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Welcome Back!",
                    style = MaterialTheme.typography.headlineMedium
                )
                Text(
                    text = "Log in to your account",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(32.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

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
                                contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                                tint = if (isPasswordVisible) MaterialTheme.colorScheme.primary else LocalContentColor.current
                            )
                        }
                    }
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = { /* TODO: Handle email login */ },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = "LOGIN", modifier = Modifier.padding(vertical = 8.dp))
                }

                // SIGN UP OPTION ADDED HERE
                Spacer(modifier = Modifier.height(16.dp))
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
                    TextButton(onClick = { /* TODO: Handle navigation to sign up screen */ }) {
                        Text(
                            text = "Sign Up",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                // END OF ADDED CODE

                Spacer(modifier = Modifier.height(24.dp)) // Adjusted spacer for better balance

                Text(
                    text = "LOGIN AS",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                ) {
                    val roles = listOf("Viewer", "Farmer", "Lab Official", "Distributor")
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(IntrinsicSize.Min),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        roles.forEachIndexed { index, role ->
                            val isSelected = (selectedRole == role)
                            Button(
                                onClick = {
                                    selectedRole = role
                                    if (role == "Viewer") {
                                        uniqueId = ""
                                    }
                                },
                                modifier = Modifier.weight(1f),
                                shape = RectangleShape,
                                elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                                    contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            ) {
                                Text(
                                    text = role,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center,
                                    lineHeight = 16.sp
                                )
                            }

                            if (index < roles.size - 1) {
                                VerticalDivider()
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = uniqueId,
                    onValueChange = { uniqueId = it },
                    label = { Text("Unique Authentication ID") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = selectedRole != "Viewer"
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    LoginScreenTheme {
        LoginScreen()
    }
}