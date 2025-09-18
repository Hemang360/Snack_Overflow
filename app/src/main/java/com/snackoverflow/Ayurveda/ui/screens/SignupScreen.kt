package com.snackoverflow.Ayurveda.ui.screens

import LoginScreenTheme
import android.widget.Toast
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.snackoverflow.Ayurveda.R // Make sure this import path is correct
import com.snackoverflow.Ayurveda.RegisterRequest // Import the new data class
import com.snackoverflow.Ayurveda.ui.navigation.Screen
import com.snackoverflow.Ayurveda.viewmodels.RegistrationState
import com.snackoverflow.Ayurveda.viewmodels.SignUpViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignUpScreen(
    navController: NavController,
    signUpViewModel: SignUpViewModel = viewModel() // Inject ViewModel
) {
    // State for all form fields
    var fullName by rememberSaveable { mutableStateOf("") }
    var username by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }

    // State for password visibility
    var isPasswordVisible by rememberSaveable { mutableStateOf(false) }
    var isConfirmPasswordVisible by rememberSaveable { mutableStateOf(false) }

    // State for Organization Type dropdown
    val organizationOptions = listOf("collector", "lab", "admin")
    var isDropdownExpanded by remember { mutableStateOf(false) }
    var selectedOrganization by rememberSaveable { mutableStateOf(organizationOptions[0]) }

    // Observe registration state from ViewModel
    val registrationState by signUpViewModel.registrationState.collectAsState()
    val context = LocalContext.current

    // Handle side-effects (showing Toasts, navigating on success)
    LaunchedEffect(registrationState) {
        when (val state = registrationState) {
            is RegistrationState.Success -> {
                Toast.makeText(context, "Registration Successful! Please log in.", Toast.LENGTH_LONG).show()
                navController.navigate(Screen.Login.route) {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true }
                }
            }
            is RegistrationState.Error -> {
                Toast.makeText(context, state.message, Toast.LENGTH_LONG).show()
            }
            else -> Unit // Do nothing for Idle or Loading
        }
    }

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
                contentDescription = "Sign up backdrop",
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
                // ... (Header Text is unchanged) ...
                Text(text = "Create Account", style = MaterialTheme.typography.headlineMedium)
                Text(
                    text = "Sign up to get started",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(32.dp))

                // ... (All OutlinedTextFields and the Dropdown are unchanged) ...
                OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(value = username, onValueChange = { username = it }, label = { Text("Username") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email Address") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), singleLine = true)
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = password, onValueChange = { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth(), singleLine = true,
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = { IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) { Icon(imageVector = Icons.Filled.Lock, contentDescription = if (isPasswordVisible) "Hide password" else "Show password") } }
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = confirmPassword, onValueChange = { confirmPassword = it }, label = { Text("Confirm Password") }, modifier = Modifier.fillMaxWidth(), singleLine = true,
                    visualTransformation = if (isConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = { IconButton(onClick = { isConfirmPasswordVisible = !isConfirmPasswordVisible }) { Icon(imageVector = Icons.Filled.Lock, contentDescription = if (isConfirmPasswordVisible) "Hide password" else "Show password") } }
                )
                Spacer(modifier = Modifier.height(16.dp))
                ExposedDropdownMenuBox(expanded = isDropdownExpanded, onExpandedChange = { isDropdownExpanded = !isDropdownExpanded }, modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(modifier = Modifier.menuAnchor().fillMaxWidth(), readOnly = true, value = selectedOrganization, onValueChange = {}, label = { Text("Organization Type") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) })
                    ExposedDropdownMenu(expanded = isDropdownExpanded, onDismissRequest = { isDropdownExpanded = false }) {
                        organizationOptions.forEach { selectionOption ->
                            DropdownMenuItem(text = { Text(selectionOption) }, onClick = { selectedOrganization = selectionOption; isDropdownExpanded = false })
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))

                // Sign Up Button - Updated onClick logic
                Button(
                    onClick = {
                        if (password != confirmPassword) {
                            Toast.makeText(context, "Passwords do not match!", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        val request = RegisterRequest(
                            username = username.trim(),
                            email = email.trim(),
                            password = password,
                            fullName = fullName.trim(),
                            organizationType = selectedOrganization
                        )
                        signUpViewModel.register(request)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    enabled = registrationState != RegistrationState.Loading // Disable button while loading
                ) {
                    if (registrationState == RegistrationState.Loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text(text = "SIGN UP", modifier = Modifier.padding(vertical = 8.dp))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ... (Navigation to Login Screen is unchanged) ...
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "Already have an account?", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    TextButton(onClick = { navController.navigate(Screen.Login.route) }) {
                        Text(text = "Log In", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}