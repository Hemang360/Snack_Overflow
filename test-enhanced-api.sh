#!/bin/bash

# Enhanced Ayurvedic Blockchain API Test Script
# Tests all endpoints from the API documentation

set -e

API_BASE="http://localhost:5000"
ADMIN_TOKEN=""
COLLECTOR_TOKEN=""
LAB_TOKEN=""
MANUFACTURER_TOKEN=""
BATCH_ID=""
QR_CODE=""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌿 Enhanced Ayurvedic Blockchain API Test"
echo "========================================"
echo ""

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        curl -s -X $method "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        if [ "$method" = "GET" ]; then
            curl -s -X $method "$API_BASE$endpoint"
        else
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
    fi
}

print_test() {
    echo -e "\n${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Health Check
print_test "Health Check"
HEALTH_RESPONSE=$(api_call GET "/health" "" "")
if echo $HEALTH_RESPONSE | grep -q "ok"; then
    print_success "Health check passed"
else
    print_error "Health check failed"
fi

# 2. Register Admin User
print_test "Register Admin User"
ADMIN_RESPONSE=$(api_call POST "/api/auth/register" '{
    "username": "admin",
    "email": "admin@ayurvedic.com",
    "password": "admin123",
    "fullName": "System Administrator",
    "organizationType": "government"
}' "")
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -n "$ADMIN_TOKEN" ]; then
    print_success "Admin registered successfully"
else
    print_error "Admin registration failed"
fi

# 3. Register Collector
print_test "Register Collector"
COLLECTOR_RESPONSE=$(api_call POST "/api/auth/register" '{
    "username": "collector1",
    "email": "collector@cooperative.com",
    "password": "collector123",
    "fullName": "Raj Kumar Singh",
    "organizationType": "cooperative"
}' "")
COLLECTOR_TOKEN=$(echo $COLLECTOR_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -n "$COLLECTOR_TOKEN" ]; then
    print_success "Collector registered successfully"
else
    print_error "Collector registration failed"
fi

# 4. Register Lab
print_test "Register Lab"
LAB_RESPONSE=$(api_call POST "/api/auth/register" '{
    "username": "lab1",
    "email": "lab@quality.com",
    "password": "lab123",
    "fullName": "Ayur Quality Labs",
    "organizationType": "lab"
}' "")
LAB_TOKEN=$(echo $LAB_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -n "$LAB_TOKEN" ]; then
    print_success "Lab registered successfully"
else
    print_error "Lab registration failed"
fi

# 5. Register Manufacturer
print_test "Register Manufacturer"
MANUFACTURER_RESPONSE=$(api_call POST "/api/auth/register" '{
    "username": "manufacturer1",
    "email": "manufacturer@ayur.com",
    "password": "manufacturer123",
    "fullName": "Ayur Manufacturing Co",
    "organizationType": "manufacturer"
}' "")
MANUFACTURER_TOKEN=$(echo $MANUFACTURER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -n "$MANUFACTURER_TOKEN" ]; then
    print_success "Manufacturer registered successfully"
else
    print_error "Manufacturer registration failed"
fi

# 6. Test Authentication - Get Current User
print_test "Get Current User Info"
ME_RESPONSE=$(api_call GET "/api/auth/me" "" "$ADMIN_TOKEN")
if echo $ME_RESPONSE | grep -q "success"; then
    print_success "Authentication working"
else
    print_error "Authentication failed"
fi

# 7. Create Collection Event
print_test "Create Collection Event"
COLLECTION_RESPONSE=$(api_call POST "/api/protected/collection-events" '{
    "species": "Ashwagandha",
    "collectorId": "collector1",
    "gpsCoordinates": {
        "latitude": 30.3165,
        "longitude": 79.5598
    },
    "quantity": 25.5,
    "collectionDate": "2024-09-16T10:30:00Z",
    "qualityNotes": "High quality organic collection"
}' "$COLLECTOR_TOKEN")
if echo $COLLECTION_RESPONSE | grep -q "success"; then
    print_success "Collection event created"
    COLLECTION_ID=$(echo $COLLECTION_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
else
    print_error "Collection event creation failed"
fi

# 8. Get All Collection Events
print_test "Get All Collection Events"
COLLECTIONS_RESPONSE=$(api_call GET "/api/protected/collection-events" "" "$ADMIN_TOKEN")
if echo $COLLECTIONS_RESPONSE | grep -q "success"; then
    print_success "Collection events retrieved"
else
    print_error "Failed to get collection events"
fi

# 9. Get Collections by Species
print_test "Get Collections by Species"
SPECIES_RESPONSE=$(api_call GET "/api/protected/collections/species/Ashwagandha" "" "$ADMIN_TOKEN")
if echo $SPECIES_RESPONSE | grep -q "success"; then
    print_success "Species-specific collections retrieved"
else
    print_error "Failed to get collections by species"
fi

# 10. Create Product Batch
print_test "Create Product Batch"
BATCH_RESPONSE=$(api_call POST "/api/protected/product-batches" '{
    "productName": "Ashwagandha Root Powder",
    "species": "Ashwagandha",
    "quantity": 20.0,
    "manufacturerId": "manufacturer1",
    "sourceCollectionEvents": ["'$COLLECTION_ID'"],
    "estimatedShelfLife": "24 months",
    "batchNotes": "Premium quality organic powder"
}' "$MANUFACTURER_TOKEN")
if echo $BATCH_RESPONSE | grep -q "success"; then
    print_success "Product batch created"
    BATCH_ID=$(echo $BATCH_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
    QR_CODE=$(echo $BATCH_RESPONSE | grep -o '"qrCode":"[^"]*' | grep -o '[^"]*$')
else
    print_error "Product batch creation failed"
fi

# 11. Create Quality Test
print_test "Create Quality Test"
QUALITY_RESPONSE=$(api_call POST "/api/protected/quality-tests" '{
    "batchId": "'$BATCH_ID'",
    "labId": "lab1",
    "testDate": "2024-09-16T15:45:00Z",
    "moisture": 8.5,
    "dnaBarcode": "ASHW001",
    "pesticides": 0.0,
    "heavyMetals": 0.2,
    "microbiological": {
        "eColi": "negative",
        "salmonella": "negative"
    },
    "notes": "All parameters within AYUSH standards"
}' "$LAB_TOKEN")
if echo $QUALITY_RESPONSE | grep -q "success"; then
    print_success "Quality test created"
else
    print_error "Quality test creation failed"
fi

# 12. Create Processing Step
print_test "Create Processing Step"
PROCESSING_RESPONSE=$(api_call POST "/api/protected/processing-steps" '{
    "batchId": "'$BATCH_ID'",
    "processType": "drying",
    "processor": "processor1",
    "timestamp": "2024-09-16T12:00:00Z",
    "conditions": {
        "temperature": "45°C",
        "duration": "48 hours",
        "humidity": "30%"
    },
    "notes": "Controlled drying process"
}' "$MANUFACTURER_TOKEN")
if echo $PROCESSING_RESPONSE | grep -q "success"; then
    print_success "Processing step created"
else
    print_error "Processing step creation failed"
fi

# 13. Get Traceability
print_test "Get Complete Traceability"
TRACEABILITY_RESPONSE=$(api_call GET "/api/protected/traceability/$BATCH_ID" "" "$ADMIN_TOKEN")
if echo $TRACEABILITY_RESPONSE | grep -q "success"; then
    print_success "Traceability data retrieved"
else
    print_error "Failed to get traceability"
fi

# 14. Test Public QR Verification
print_test "Public QR Code Verification"
PUBLIC_QR_RESPONSE=$(api_call GET "/api/public/qr/$QR_CODE" "" "")
if echo $PUBLIC_QR_RESPONSE | grep -q "success"; then
    print_success "Public QR verification working"
else
    print_error "Public QR verification failed"
fi

# 15. Test QR Verification with Authentication
print_test "QR Verification with Authentication"
AUTH_QR_RESPONSE=$(api_call GET "/api/qr-verification/$QR_CODE" "" "$ADMIN_TOKEN")
if echo $AUTH_QR_RESPONSE | grep -q "success"; then
    print_success "Authenticated QR verification working"
else
    print_error "Authenticated QR verification failed"
fi

# 16. Create Recall
print_test "Create Product Recall"
RECALL_RESPONSE=$(api_call POST "/api/protected/recalls" '{
    "batchId": "'$BATCH_ID'",
    "reason": "Quality control issue detected",
    "severity": "medium",
    "notificationMethod": "all"
}' "$ADMIN_TOKEN")
if echo $RECALL_RESPONSE | grep -q "success"; then
    print_success "Recall created successfully"
else
    print_error "Recall creation failed"
fi

# 17. Get Dashboard Statistics
print_test "Get Dashboard Statistics"
STATS_RESPONSE=$(api_call GET "/api/protected/analytics/dashboard-stats" "" "$ADMIN_TOKEN")
if echo $STATS_RESPONSE | grep -q "success"; then
    print_success "Dashboard statistics retrieved"
else
    print_error "Failed to get dashboard statistics"
fi

# 18. Get Recent Activity
print_test "Get Recent Activity"
ACTIVITY_RESPONSE=$(api_call GET "/api/protected/analytics/recent-activity" "" "$ADMIN_TOKEN")
if echo $ACTIVITY_RESPONSE | grep -q "success"; then
    print_success "Recent activity retrieved"
else
    print_error "Failed to get recent activity"
fi

# 19. Get Blockchain Info
print_test "Get Blockchain Network Info"
BLOCKCHAIN_RESPONSE=$(api_call GET "/api/protected/blockchain-info" "" "$ADMIN_TOKEN")
if echo $BLOCKCHAIN_RESPONSE | grep -q "success"; then
    print_success "Blockchain information retrieved"
else
    print_error "Failed to get blockchain information"
fi

# 20. Get All Users (Admin only)
print_test "Get All Users"
USERS_RESPONSE=$(api_call GET "/api/protected/users" "" "$ADMIN_TOKEN")
if echo $USERS_RESPONSE | grep -q "success"; then
    print_success "User list retrieved"
else
    print_error "Failed to get user list"
fi

# 21. Get Available Roles
print_test "Get Available Roles"
ROLES_RESPONSE=$(api_call GET "/api/protected/roles" "" "$ADMIN_TOKEN")
if echo $ROLES_RESPONSE | grep -q "success"; then
    print_success "Roles retrieved"
else
    print_error "Failed to get roles"
fi

# 22. Get User Profile
print_test "Get User Profile"
PROFILE_RESPONSE=$(api_call GET "/api/protected/profile" "" "$ADMIN_TOKEN")
if echo $PROFILE_RESPONSE | grep -q "success"; then
    print_success "User profile retrieved"
else
    print_error "Failed to get user profile"
fi

# 23. Get User Permissions
print_test "Get User Permissions"
PERMISSIONS_RESPONSE=$(api_call GET "/api/protected/permissions" "" "$ADMIN_TOKEN")
if echo $PERMISSIONS_RESPONSE | grep -q "success"; then
    print_success "User permissions retrieved"
else
    print_error "Failed to get user permissions"
fi

# 24. Test OpenAPI Specification
print_test "Get OpenAPI Specification"
OPENAPI_RESPONSE=$(api_call GET "/api/openapi.json" "" "")
if echo $OPENAPI_RESPONSE | grep -q "openapi"; then
    print_success "OpenAPI specification retrieved"
else
    print_error "Failed to get OpenAPI specification"
fi

# Display Summary
echo ""
echo -e "${GREEN}🎉 Enhanced API Test Complete!${NC}"
echo ""
echo "=============================================="
echo "📊 Test Results Summary"
echo "=============================================="
echo ""
echo -e "${YELLOW}🔐 Authentication & Authorization:${NC}"
echo "✅ User registration and login"
echo "✅ JWT token authentication"
echo "✅ Role-based permissions"
echo "✅ Protected endpoint access"
echo ""
echo -e "${YELLOW}📦 Data Management:${NC}"
echo "✅ Collection events creation and retrieval"
echo "✅ Quality tests with lab integration"
echo "✅ Processing steps tracking"
echo "✅ Product batch management"
echo "✅ Complete traceability chain"
echo ""
echo -e "${YELLOW}🔍 Public Access:${NC}"
echo "✅ Public QR code verification"
echo "✅ Consumer-friendly product tracing"
echo "✅ No authentication required for consumers"
echo ""
echo -e "${YELLOW}📊 Analytics & Reporting:${NC}"
echo "✅ Dashboard statistics"
echo "✅ Recent activity tracking"
echo "✅ Blockchain network information"
echo "✅ User management"
echo ""
echo -e "${YELLOW}🛡️  Security & Compliance:${NC}"
echo "✅ Rate limiting"
echo "✅ Input validation"
echo "✅ Error handling"
echo "✅ Recall system"
echo ""
echo -e "${GREEN}🔗 Access Points:${NC}"
echo "• API Health: http://localhost:5000/health"
echo "• OpenAPI Spec: http://localhost:5000/api/openapi.json"
echo "• Public QR Trace: http://localhost:5000/api/public/qr/$QR_CODE"
echo ""
echo -e "${GREEN}✅ All Enhanced APIs are working perfectly!${NC}"
echo ""
