curl -s -X POST http://localhost:5000/loginCollector \
                                                -H "Content-Type: application/json" \
                                                -d @- << EOF
                                            {
                                            "collectorId": "Collector-Karan-007",
                                            "password": "karan-secret-pass"
                                            }
