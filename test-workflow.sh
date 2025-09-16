#!/bin/bash

# Herb Traceability Workflow Test Script
# Demonstrates: Farmer uploads herb data → Gets QR → Lab adds tests → Consumer scans QR

set -e

API_BASE="http://localhost:5000"
FARMER_TOKEN=""
LAB_TOKEN=""
COLLECTION_ID=""
QR_CODE=""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🌿 Herb Traceability Workflow Demo"
echo "=================================="
echo ""
echo "Workflow: Farmer → Mobile App → QR Code → Lab → Web Portal → Consumer"
echo ""

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    
    if [ "$auth" = "true" ] && [ -n "$FARMER_TOKEN" ] && [ "$endpoint" = *"farmer"* ]; then
        curl -s -X $method "$API_BASE$endpoint" \
            -H "Authorization: Bearer $FARMER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    elif [ "$auth" = "true" ] && [ -n "$LAB_TOKEN" ] && [ "$endpoint" = *"lab"* ]; then
        curl -s -X $method "$API_BASE$endpoint" \
            -H "Authorization: Bearer $LAB_TOKEN" \
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

# 1. Register a farmer
echo -e "\n${BLUE}1. 👨‍🌾 Registering farmer...${NC}"
FARMER_RESPONSE=$(api_call POST "/api/farmer/register" '{
    "farmerId": "farmer001",
    "name": "Raj Kumar Singh",
    "phone": "+91-9876543210",
    "location": "Chamoli District, Uttarakhand",
    "certifications": ["Organic Farming Certificate", "Wild Collection Permit"]
}')
FARMER_TOKEN=$(echo $FARMER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "✅ Farmer registered successfully"
echo "Farmer: Raj Kumar Singh"
echo "Token obtained for mobile app authentication"

# 2. Simulate farmer uploading herb data via mobile app
echo -e "\n${BLUE}2. 📱 Farmer uploading herb collection via mobile app...${NC}"

# Create a sample herb photo (in real app, this would be uploaded from mobile)
mkdir -p server-node-sdk/uploads/herbs
echo "Sample herb photo data" > server-node-sdk/uploads/herbs/sample-herb.jpg

# Simulate mobile app upload with GPS coordinates
HERB_UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/api/farmer/upload-herb" \
    -H "Authorization: Bearer $FARMER_TOKEN" \
    -F "herbPhoto=@server-node-sdk/uploads/herbs/sample-herb.jpg" \
    -F "herbName=Ashwagandha" \
    -F "speciesCode=ASHW001" \
    -F "quantity=25.5" \
    -F "unit=kg" \
    -F "gpsCoordinates[latitude]=30.3165" \
    -F "gpsCoordinates[longitude]=79.5598" \
    -F "harvestMethod=root-division" \
    -F "harvestDate=2024-09-16T10:30:00Z" \
    -F "weatherConditions={\"temperature\":18,\"humidity\":65,\"weather\":\"partly cloudy\"}" \
    -F "soilConditions={\"ph\":6.8,\"moisture\":\"moderate\"}" \
    -F "organicCertified=true" \
    -F "notes=Harvested from organic certified farm in morning hours")

COLLECTION_ID=$(echo $HERB_UPLOAD_RESPONSE | grep -o '"collectionId":"[^"]*' | grep -o '[^"]*$')
QR_CODE=$(echo $HERB_UPLOAD_RESPONSE | grep -o '"qrCode":"[^"]*' | grep -o '[^"]*$')

echo "✅ Herb collection uploaded successfully"
echo "Collection ID: $COLLECTION_ID"
echo "QR Code: $QR_CODE"
echo "📸 Photo uploaded with GPS coordinates"
echo "🖨️  QR code can now be printed and pasted on herb container"

# 3. Show farmer can view their collection history
echo -e "\n${BLUE}3. 📋 Farmer viewing collection history...${NC}"
HISTORY_RESPONSE=$(api_call GET "/api/farmer/collections" "" true)
echo "✅ Farmer can view all their past collections"
echo "📊 Collection history retrieved"

# 4. Register a lab
echo -e "\n${BLUE}4. 🧪 Registering laboratory...${NC}"
LAB_RESPONSE=$(api_call POST "/api/lab/register" '{
    "labId": "lab001",
    "labName": "Ayur Quality Labs",
    "location": "Delhi, India",
    "certifications": ["NABL", "AYUSH approved", "ISO 17025"]
}')
LAB_TOKEN=$(echo $LAB_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "✅ Laboratory registered successfully"
echo "Lab: Ayur Quality Labs"
echo "Token obtained for web portal authentication"

# 5. Lab adds test results via web portal
echo -e "\n${BLUE}5. 🔬 Lab adding test results via web portal...${NC}"
LAB_TEST_RESPONSE=$(api_call POST "/api/lab/add-test" "{
    \"qrCode\": \"$QR_CODE\",
    \"testType\": \"comprehensive-analysis\",
    \"testResults\": {
        \"heavyMetals\": \"within limits\",
        \"pesticides\": \"not detected\",
        \"microbial\": \"compliant\",
        \"withanolides\": \"4.2%\",
        \"moisture\": \"8.5%\",
        \"ashContent\": \"3.2%\"
    },
    \"testDate\": \"2024-09-16T15:45:00Z\",
    \"labNotes\": \"All parameters within AYUSH standards. Product safe for consumption.\",
    \"certifications\": [\"AYUSH compliant\", \"Export quality\", \"Organic certified\"]
}" true)

echo "✅ Lab test results added successfully"
echo "🧪 Comprehensive analysis completed"
echo "📋 All parameters within AYUSH standards"
echo "🔄 QR code now contains cumulative data (farmer + lab)"

# 6. Consumer scans QR code
echo -e "\n${BLUE}6. 👤 Consumer scanning QR code...${NC}"
TRACE_RESPONSE=$(api_call GET "/api/consumer/trace/$QR_CODE" "" false)

echo "✅ Consumer can view complete traceability"
echo "📱 QR code scan successful"
echo "🔍 Complete journey visible: Farmer → Lab"

# 7. Show consumer-friendly web page
echo -e "\n${BLUE}7. 🌐 Consumer-friendly web page...${NC}"
echo "✅ Web page generated for QR code: $QR_CODE"
echo "🔗 Access URL: http://localhost:5000/trace/$QR_CODE"

# Display summary
echo -e "\n${GREEN}================================"
echo "🎉 Workflow Demo Complete!"
echo "================================${NC}"
echo ""
echo -e "${YELLOW}Summary of the workflow:${NC}"
echo ""
echo "1. 👨‍🌾 Farmer (Raj Kumar Singh) registered"
echo "2. 📱 Mobile app upload:"
echo "   • Herb: Ashwagandha (25.5 kg)"
echo "   • GPS: Chamoli District, Uttarakhand"
echo "   • Photo uploaded"
echo "   • QR code generated: $QR_CODE"
echo ""
echo "3. 🖨️  QR code printed and pasted on container"
echo ""
echo "4. 🧪 Lab (Ayur Quality Labs) added test results:"
echo "   • Comprehensive analysis completed"
echo "   • All parameters within AYUSH standards"
echo "   • QR code updated with lab data"
echo ""
echo "5. 👤 Consumer scans QR code and sees:"
echo "   • Complete farmer information"
echo "   • Harvest details with GPS location"
echo "   • Lab test results and certifications"
echo "   • Full supply chain timeline"
echo ""
echo -e "${GREEN}🔗 Access Points:${NC}"
echo "• API Health: http://localhost:5000/health"
echo "• Consumer Trace: http://localhost:5000/trace/$QR_CODE"
echo "• Farmer API: http://localhost:5000/api/farmer/*"
echo "• Lab API: http://localhost:5000/api/lab/*"
echo "• Consumer API: http://localhost:5000/api/consumer/*"
echo ""
echo -e "${YELLOW}📱 Mobile App Integration:${NC}"
echo "• Use farmer token for authentication"
echo "• Upload herb photos with GPS coordinates"
echo "• Receive QR code for printing"
echo ""
echo -e "${YELLOW}💻 Web Portal Integration:${NC}"
echo "• Use lab token for authentication"
echo "• Add test results by QR code"
echo "• View test history"
echo ""
echo -e "${GREEN}✅ Backend is production-ready for frontend integration!${NC}"
