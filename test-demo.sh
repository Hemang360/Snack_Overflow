#!/bin/bash

# Demo script to test the herb traceability system
# This script demonstrates the complete flow from collection to consumer

set -e

API_BASE="http://localhost:5000"
TOKEN=""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🌿 Herb Traceability System Demo"
echo "================================"

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    
    if [ "$auth" = "true" ] && [ -n "$TOKEN" ]; then
        if [ "$method" = "GET" ]; then
            curl -s -X $method "$API_BASE$endpoint" -H "Authorization: Bearer $TOKEN"
        else
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data"
        fi
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

# 1. Register a cooperative
echo -e "\n${BLUE}1. Registering cooperative admin...${NC}"
COOP_RESPONSE=$(api_call POST "/api/auth/register" '{
    "userId": "coop-admin-001",
    "password": "admin123",
    "role": "cooperative",
    "organizationId": "cooperative001",
    "profile": {
        "name": "Himalayan Herbs Cooperative",
        "location": "Uttarakhand, India"
    }
}')
echo "Response: $COOP_RESPONSE"

# 2. Register a collector
echo -e "\n${BLUE}2. Registering herb collector...${NC}"
COLLECTOR_RESPONSE=$(api_call POST "/api/auth/register" '{
    "userId": "collector-raj-001",
    "password": "collector123",
    "role": "collector",
    "organizationId": "cooperative001",
    "profile": {
        "name": "Raj Kumar",
        "location": "Chamoli District, Uttarakhand",
        "certifications": ["Organic Farming", "Wild Collection Permit"]
    }
}')
TOKEN=$(echo $COLLECTOR_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Collector registered. Token obtained."

# 3. Create a collection event
echo -e "\n${BLUE}3. Creating herb collection event...${NC}"
COLLECTION_RESPONSE=$(api_call POST "/api/collection/create" '{
    "herbSpecies": "Ashwagandha",
    "speciesCode": "ASHW001",
    "quantity": 25.5,
    "unit": "kg",
    "gpsCoordinates": {
        "latitude": 30.3165,
        "longitude": 79.5598
    },
    "harvestMethod": "root-division",
    "weatherConditions": {
        "temperature": 18,
        "humidity": 65,
        "weather": "partly cloudy"
    },
    "soilConditions": {
        "ph": 6.8,
        "moisture": "moderate"
    },
    "plantAge": 24,
    "wildcrafted": false,
    "organicCertified": true
}' true)
EVENT_ID=$(echo $COLLECTION_RESPONSE | grep -o '"eventId":"[^"]*' | grep -o '[^"]*$' | head -1)
echo "Collection event created: $EVENT_ID"

# 4. Register a processor
echo -e "\n${BLUE}4. Registering processing facility...${NC}"
PROCESSOR_RESPONSE=$(api_call POST "/api/auth/register" '{
    "userId": "processor-001",
    "password": "processor123",
    "role": "processor",
    "organizationId": "processing-facility-001",
    "profile": {
        "name": "Ayur Processing Hub",
        "location": "Haridwar, Uttarakhand",
        "certifications": ["GMP", "ISO 9001"]
    }
}')
PROCESSOR_TOKEN=$(echo $PROCESSOR_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# 5. Transfer custody to processor
echo -e "\n${BLUE}5. Transferring custody to processor...${NC}"
TRANSFER_RESPONSE=$(api_call POST "/api/custody/transfer" '{
    "eventId": "'$EVENT_ID'",
    "toEntity": "processor-001",
    "transferType": "sale",
    "notes": "Batch transferred for drying and processing"
}' true)
echo "Custody transferred to processor"

# 6. Add processing step
echo -e "\n${BLUE}6. Adding processing step...${NC}"
TOKEN=$PROCESSOR_TOKEN
PROCESSING_RESPONSE=$(api_call POST "/api/processing/add" '{
    "collectionEventIds": ["'$EVENT_ID'"],
    "processType": "drying",
    "inputQuantity": 25.5,
    "outputQuantity": 5.1,
    "processingMethod": "shade-drying",
    "temperature": 35,
    "humidity": 40,
    "duration": 168,
    "qualityChecks": ["moisture-content", "color-inspection"],
    "certifications": ["GMP-compliant"]
}' true)
echo "Processing step added"

# 7. Register a lab
echo -e "\n${BLUE}7. Registering testing laboratory...${NC}"
LAB_RESPONSE=$(api_call POST "/api/auth/register" '{
    "userId": "lab-001",
    "password": "lab123",
    "role": "lab",
    "organizationId": "testing-lab-001",
    "profile": {
        "name": "Ayur Quality Labs",
        "location": "Delhi, India",
        "certifications": ["NABL", "AYUSH approved"]
    }
}')
LAB_TOKEN=$(echo $LAB_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# 8. Add quality test
echo -e "\n${BLUE}8. Adding quality test results...${NC}"
TOKEN=$LAB_TOKEN
TEST_RESPONSE=$(api_call POST "/api/quality/test" '{
    "targetId": "'$EVENT_ID'",
    "targetType": "collection",
    "testType": "comprehensive-analysis",
    "labName": "Ayur Quality Labs",
    "testParameters": ["heavy-metals", "pesticides", "microbial", "active-compounds"],
    "results": {
        "heavyMetals": "within limits",
        "pesticides": "not detected",
        "microbial": "compliant",
        "withanolides": "4.2%"
    },
    "compliance": {
        "ayushStandards": true,
        "exportStandards": true,
        "organicCertified": true
    }
}' true)
echo "Quality test results added"

# 9. Register a manufacturer
echo -e "\n${BLUE}9. Registering manufacturer...${NC}"
MANUFACTURER_RESPONSE=$(api_call POST "/api/auth/register" '{
    "userId": "manufacturer-001",
    "password": "manufacturer123",
    "role": "manufacturer",
    "organizationId": "manufacturing-001",
    "profile": {
        "name": "Ancient Herbs Formulations",
        "location": "Mumbai, India",
        "certifications": ["AYUSH GMP", "ISO 22000"]
    }
}')
MANUFACTURER_TOKEN=$(echo $MANUFACTURER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# 10. Create final product
echo -e "\n${BLUE}10. Creating final product with QR code...${NC}"
TOKEN=$MANUFACTURER_TOKEN
PRODUCT_RESPONSE=$(api_call POST "/api/product/create" '{
    "productName": "Premium Ashwagandha Capsules",
    "productType": "Herbal Supplement",
    "ingredients": [
        {
            "collectionEventId": "'$EVENT_ID'",
            "percentage": 95
        }
    ],
    "manufacturingProcess": "encapsulation",
    "batchSize": "1000 units",
    "packaging": "60 capsules per bottle",
    "expiryDate": "2026-12-31",
    "certifications": ["AYUSH certified", "Organic", "Non-GMO"]
}' true)
QR_CODE=$(echo $PRODUCT_RESPONSE | grep -o '"qrCode":"[^"]*' | grep -o '[^"]*$')
echo "Product created with QR code: $QR_CODE"

# 11. Test consumer tracing
echo -e "\n${BLUE}11. Testing consumer QR code scanning...${NC}"
echo "QR Code: $QR_CODE"
TRACE_RESPONSE=$(api_call GET "/api/trace/$QR_CODE")
echo -e "\n${GREEN}✅ Consumer can now trace the product!${NC}"

# Display summary
echo -e "\n${GREEN}================================"
echo "Demo Complete!"
echo "================================${NC}"
echo ""
echo "Summary:"
echo "- Collection Event ID: $EVENT_ID"
echo "- QR Code: $QR_CODE"
echo ""
echo "To view the consumer trace page, open:"
echo "http://localhost:5000/trace/$QR_CODE"
echo ""
echo "Or visit the consumer portal at:"
echo "http://localhost:8080"
echo "And enter the QR code: $QR_CODE"
echo ""
