package com.snackoverflow.Ayurveda

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

class TokenManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val TOKEN_KEY = "jwt_token"
        private const val USER_ID_KEY = "user_id"
        private const val USER_EMAIL_KEY = "user_email"
        private const val USER_ROLE_KEY = "user_role"
        private const val TAG = "TokenManager"
    }
    
    fun saveToken(jwtToken: String) {
        Log.d(TAG, "Saving JWT token: ${jwtToken.take(50)}...")
        prefs.edit().putString(TOKEN_KEY, jwtToken).apply()
        Log.d(TAG, "JWT token saved successfully")
    }
    
    fun saveUserSession(userId: String, email: String, role: String, jwtToken: String) {
        Log.d(TAG, "Saving user session - ID: $userId, Email: $email, Role: $role")
        Log.d(TAG, "Saving JWT token: ${jwtToken.take(50)}...")
        prefs.edit().apply {
            putString(TOKEN_KEY, jwtToken)
            putString(USER_ID_KEY, userId)
            putString(USER_EMAIL_KEY, email)
            putString(USER_ROLE_KEY, role)
            apply()
        }
        Log.d(TAG, "User session saved successfully")
    }
    
    fun getToken(): String? {
        val jwtToken = prefs.getString(TOKEN_KEY, null)
        Log.d(TAG, "Retrieved JWT token: ${jwtToken?.take(50)}...")
        return jwtToken
    }
    
    fun getUserId(): String? {
        return prefs.getString(USER_ID_KEY, null)
    }
    
    fun getUserEmail(): String? {
        return prefs.getString(USER_EMAIL_KEY, null)
    }
    
    fun getUserRole(): String? {
        return prefs.getString(USER_ROLE_KEY, null)
    }
    
    fun clearToken() {
        Log.d(TAG, "Clearing JWT token")
        prefs.edit().remove(TOKEN_KEY).apply()
    }
    
    fun clearUserSession() {
        Log.d(TAG, "Clearing user session")
        prefs.edit().apply {
            remove(TOKEN_KEY)
            remove(USER_ID_KEY)
            remove(USER_EMAIL_KEY)
            remove(USER_ROLE_KEY)
            apply()
        }
        Log.d(TAG, "User session cleared successfully")
    }
    
    fun hasToken(): Boolean {
        val hasJwtToken = getToken() != null
        Log.d(TAG, "Has JWT token: $hasJwtToken")
        return hasJwtToken
    }
    
    fun validateToken(): Boolean {
        val jwtToken = getToken()
        if (jwtToken == null) {
            Log.d(TAG, "No JWT token to validate")
            return false
        }
        
        // Log the full JWT token for debugging (remove this in production)
        Log.d(TAG, "Full JWT token to validate: $jwtToken")
        
        // Basic JWT validation - should have 3 parts separated by dots
        val parts = jwtToken.split(".")
        val isValid = parts.size == 3
        Log.d(TAG, "JWT token validation: $isValid (parts: ${parts.size})")
        
        if (!isValid) {
            Log.e(TAG, "Invalid JWT format - should have 3 parts separated by dots")
            Log.e(TAG, "JWT token parts: $parts")
        }
        
        return isValid
    }
}
