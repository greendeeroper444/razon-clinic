

# EXPORT BILLINGS
# export all paid billings as Excel
GET /api/billings/export?format=xlsx&paymentStatus=Paid

# export specific date range as CSV
GET /api/billings/export?format=csv&fromDate=2024-01-01&toDate=2024-12-31

# export billings for specific patient
GET /api/billings/export?format=xlsx&patientName=John Doe

# export unpaid billings over ₱1000
GET /api/billings/export?format=xlsx&paymentStatus=Unpaid&minAmount=1000