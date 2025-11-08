
# INVENTORY REPORTS
# Get Inventory Report (Today)
GET /api/reports/getInventoryReport?period=today&page=1&limit=10
# Get Inventory Report (This Week)
GET /api/reports/getInventoryReport?period=week&page=1&limit=10
# Get Inventory Report (This Month)
GET /api/reports/getInventoryReport?period=month
# Get Inventory Report (This Year)
GET /api/reports/getInventoryReport?period=year
# Get Inventory Report (Custom Date Range)
GET /api/reports/getInventoryReport?fromDate=2024-01-01&toDate=2024-12-31
# Get Inventory Report with Filters
GET /api/reports/getInventoryReport?period=month&category=Vaccine&search=Pfizer
# Get Inventory Summary
GET /api/reports/getInventorySummary




# SALES REPORTS
# Get Sales Report (Today)
GET /api/reports/getSalesReport?period=today&page=1&limit=10
# Get Sales Report (This Week)
GET /api/reports/getSalesReport?period=week
# Get Sales Report (This Month)
GET /api/reports/getSalesReport?period=month
# Get Sales Report (This Year)
GET /api/reports/getSalesReport?period=year
# Get Sales Report (Custom Date Range)
GET /api/reports/getSalesReport?fromDate=2024-11-01&toDate=2024-11-08
# Get Sales Report with Filters
GET /api/reports/getSalesReport?period=month&paymentStatus=Paid&search=John
# Get Sales Summary
GET /api/reports/getSalesSummary


# DASHBOARD REPORT
# Get Combined Dashboard Report
GET /api/reports/getDashboardReport