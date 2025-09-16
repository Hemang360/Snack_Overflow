

#!/bin/bash

COOPERATIVE_ID="cooperativeAdmin"
COLLECTOR_ID_1="Collector-Karan-007"
COLLECTOR_NAME_1="Dr. Karan Sharma"
COLLECTOR_PASS_1="karan-secret-pass"
COLLECTOR_CITY_1="Bengaluru"
COLLECTOR_ID_2="Collector-Priya-008"
COLLECTOR_NAME_2="Dr. Priya Singh"
COLLECTOR_PASS_2="priya-secret-pass"
COLLECTOR_CITY_2="Mumbai"
HERBBATCH_ID="HB-Patient-998"
HERBBATCH_NAME="Rohan Kumar"
HERBBATCH_DOB="1992-08-25"
HERBBATCH_CITY="Bengaluru"
BASE_URL="http://localhost:5000"

echo "🚀 Starting Full API Test Script..."
echo "---------------------------------------------------------"

# 1. Check Server Status
echo -e "\n## 1. Checking Server Status ##"
curl $BASE_URL/status
echo -e "\n"; sleep 1

# 2a. Register Collector 1
echo "## 2a. Registering Collector 1 ##"
curl -s -X POST $BASE_URL/registerCollector \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "cooperativeId": "$COOPERATIVE_ID",
  "collectorId": "$COLLECTOR_ID_1",
  "name": "$COLLECTOR_NAME_1",
  "city": "$COLLECTOR_CITY_1",
  "password": "$COLLECTOR_PASS_1",
  "specialization": "Cardiology",
  "cooperativeName": "Bengaluru Health Cooperative"
}
EOF
echo -e "\n"; sleep 1

# 2b. Register Collector 2
echo "## 2b. Registering Collector 2 ##"
curl -s -X POST $BASE_URL/registerCollector \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "cooperativeId": "$COOPERATIVE_ID",
  "collectorId": "$COLLECTOR_ID_2",
  "name": "$COLLECTOR_NAME_2",
  "city": "$COLLECTOR_CITY_2",
  "password": "$COLLECTOR_PASS_2",
  "specialization": "Neurology",
  "cooperativeName": "Bengaluru Health Cooperative"
}
EOF
echo -e "\n"; sleep 1

# 3. Login Collector 1
echo "## 3. Logging in Collector 1 ##"
curl -s -X POST $BASE_URL/loginCollector \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "collectorId": "$COLLECTOR_ID_1",
  "password": "$COLLECTOR_PASS_1"
}
EOF
echo -e "\n"; sleep 1

# 4. Register Herbbatch by Collector 1
echo "## 4. Registering Herbbatch ##"
curl -s -X POST $BASE_URL/registerHerbbatch \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "collectorId": "$COLLECTOR_ID_1",
  "herbbatchId": "$HERBBATCH_ID",
  "name": "$HERBBATCH_NAME",
  "dob": "$HERBBATCH_DOB",
  "city": "$HERBBATCH_CITY"
}
EOF
echo -e "\n"; sleep 1

# 5. Add Medical Record to Herbbatch
echo "## 5. Adding Medical Record ##"
ADD_RECORD_RESPONSE=$(curl -s -X POST $BASE_URL/addRecord \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "userId": "$COLLECTOR_ID_1",
  "herbbatchId": "$HERBBATCH_ID",
  "diagnosis": "Hypertension Stage 1",
  "prescription": "Amlodipine 5mg",
  "notes": "Monitor blood pressure daily."
}
EOF
)
echo $ADD_RECORD_RESPONSE

RECORD_ID=$(echo $ADD_RECORD_RESPONSE | jq -r '.data.recordId')
echo -e "\n"; sleep 1

# 6. Get All Records for Herbbatch
echo "## 6. Get All Records for Herbbatch ##"
curl -s -X POST $BASE_URL/getAllRecordsByHerbbatchId \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "userId": "$COLLECTOR_ID_1",
  "herbbatchId": "$HERBBATCH_ID"
}
EOF
echo -e "\n"; sleep 1

# 7. Get Specific Medical Record by ID (if exists)
if [[ -z "$RECORD_ID" || "$RECORD_ID" == "null" ]]; then
  echo "## 7. SKIPPING Get Specific Record (missing recordId) ##"
else
  echo "## 7. Get Specific Record ($RECORD_ID) ##"
  curl -s -X POST $BASE_URL/getRecordById \
  -H "Content-Type: application/json" \
  -d @- << EOF
  {
    "userId": "$COLLECTOR_ID_1",
    "herbbatchId": "$HERBBATCH_ID",
    "recordId": "$RECORD_ID"
  }
EOF
fi
echo -e "\n"; sleep 1

# 8. Grant Access to Collector 2
echo "## 8. Granting Collector 2 Access to Herbbatch ##"
curl -s -X POST $BASE_URL/grantAccess \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "userId": "$COLLECTOR_ID_1",
  "herbbatchId": "$HERBBATCH_ID",
  "collectorIdToGrant": "$COLLECTOR_ID_2"
}
EOF
echo -e "\n"; sleep 1

# 9. Get All Collectors (Admin)
echo "## 9. Get All Collectors ##"
curl -s -X POST $BASE_URL/getAllCollectors \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "userId": "$COOPERATIVE_ID"
}
EOF
echo -e "\n"; sleep 1

# 10. Fetch Entire Ledger (Admin)
echo "## 10. Fetching Entire Ledger ##"
curl -s -X POST $BASE_URL/fetchLedger \
-H "Content-Type: application/json" \
-d @- << EOF
{
  "userId": "$COOPERATIVE_ID"
}
EOF
echo -e "\n"; sleep 1

echo "✅ Test Script Finished."
echo "---------------------------------------------------------"







