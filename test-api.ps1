# Test Backend API Connection
Write-Host "Testing Lost and Found Backend..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "[OK] Backend is running" -ForegroundColor Green
    Write-Host "  Response: $($health.message)"
} catch {
    Write-Host "[ERROR] Backend is NOT running" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "SOLUTION: Start backend with: cd backend; node server.js" -ForegroundColor Yellow
    exit
}

# Test 2: Database Stats
Write-Host ""
Write-Host "Test 2: Database Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/stats" -Method Get
    Write-Host "[OK] Database connection working" -ForegroundColor Green
    Write-Host "  Total items: $($stats.stats.total)"
    Write-Host "  Pending: $($stats.stats.pending)"
    Write-Host "  Lost: $($stats.stats.lost)"
    Write-Host "  Found: $($stats.stats.found)"
} catch {
    Write-Host "[ERROR] Database connection failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "  1. Ensure MySQL is running"
    Write-Host "  2. Database 'lost_and_found' exists"
    Write-Host "  3. Check DB credentials in backend/.env"
    exit
}

# Test 3: Get All Items
Write-Host ""
Write-Host "Test 3: Fetching Items" -ForegroundColor Yellow
try {
    $items = Invoke-RestMethod -Uri "http://localhost:5000/api/items/all" -Method Get
    Write-Host "[OK] Can fetch items" -ForegroundColor Green
    Write-Host "  Found $($items.items.Count) item(s) in database"
    
    if ($items.items.Count -eq 0) {
        Write-Host ""
        Write-Host "[WARNING] Database is empty - no reports yet" -ForegroundColor Yellow
        Write-Host "  Try creating a test report through the UI"
    } else {
        Write-Host ""
        Write-Host "Sample item:" -ForegroundColor Cyan
        $items.items[0] | Format-List id, item_type, description, created_at, is_found
    }
} catch {
    Write-Host "[ERROR] Cannot fetch items" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Green
