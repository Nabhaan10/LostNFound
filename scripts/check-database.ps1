$allStats = Invoke-RestMethod -Uri "http://localhost:5000/api/stats" -Method Get
$allItems = Invoke-RestMethod -Uri "http://localhost:5000/api/items/all" -Method Get

Write-Host "=== DATABASE STATUS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total items ever created: $($allStats.stats.total)" -ForegroundColor Yellow
Write-Host "Currently pending items: $($allStats.stats.pending)" -ForegroundColor Yellow
Write-Host "Resolved today: $($allStats.stats.resolvedToday)" -ForegroundColor Yellow
Write-Host "Lost (pending): $($allStats.stats.lost)" -ForegroundColor Yellow
Write-Host "Found (pending): $($allStats.stats.found)" -ForegroundColor Yellow
Write-Host ""

if ($allStats.stats.total -gt 0 -and $allStats.stats.pending -eq 0) {
    Write-Host "[ISSUE FOUND]" -ForegroundColor Red
    Write-Host "All $($allStats.stats.total) items in database are marked as RESOLVED or DELETED." -ForegroundColor Red
    Write-Host "That's why you see 0 reports!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Green
    Write-Host "1. Create new test reports through the UI" -ForegroundColor White
    Write-Host "2. Or restore old items by running: UPDATE items SET status='pending' WHERE id > 0" -ForegroundColor White
} elseif ($allStats.stats.pending -eq 0) {
    Write-Host "[INFO] No items in database yet. Create some reports!" -ForegroundColor Yellow
} else {
    Write-Host "[OK] You have $($allStats.stats.pending) pending items" -ForegroundColor Green
}
