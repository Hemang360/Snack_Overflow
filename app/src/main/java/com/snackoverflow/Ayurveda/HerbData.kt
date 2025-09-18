package com.snackoverflow.Ayurveda

import kotlinx.serialization.Serializable

@Serializable
data class LocationData(
    val latitude: Double,
    val longitude: Double
)

@Serializable
data class HerbRecord(
    val species: String,
    val collectorId: String,
    val location: LocationData,
    val quantity: Double,
    val collectionDate: String, // e.g., "2025-09-18"
    val qualityNotes: String,
    val herbImage: String // URL or Base64 string
)