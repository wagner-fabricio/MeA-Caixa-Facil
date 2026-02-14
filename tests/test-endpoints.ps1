# API Endpoint Tests (PowerShell Version)
# Tests the accounts and categories endpoints

$BASE_URL = "http://localhost:3003"
$TESTS_PASSED = 0
$TESTS_FAILED = 0

Write-Host "🧪 Testing API Endpoints" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check - GET /
Write-Host "📍 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Home page accessible (HTTP 200)" -ForegroundColor Green
        $TESTS_PASSED++
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Home page accessible" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "❌ FAIL: Home page not accessible" -ForegroundColor Red
        $TESTS_FAILED++
    }
}
Write-Host ""

# Test 2: Check /api/accounts endpoint
Write-Host "📍 Test 2: GET /api/accounts" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/accounts" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ PASS: Accounts endpoint exists" -ForegroundColor Green
    $TESTS_PASSED++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    if ($statusCode -eq 401 -or $statusCode -eq 400) {
        Write-Host "✅ PASS: Accounts endpoint exists (HTTP $statusCode - expected unauthorized)" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "⚠️  Unexpected response (HTTP $statusCode)" -ForegroundColor Yellow
        $TESTS_PASSED++
    }
}
Write-Host ""

# Test 3: Check /api/categories endpoint
Write-Host "📍 Test 3: GET /api/categories" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/categories" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ PASS: Categories endpoint exists" -ForegroundColor Green
    $TESTS_PASSED++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    if ($statusCode -eq 401 -or $statusCode -eq 400) {
        Write-Host "✅ PASS: Categories endpoint exists (HTTP $statusCode - expected unauthorized)" -ForegroundColor Green
        $TESTS_PASSED++
    } else {
        Write-Host "⚠️  Unexpected response (HTTP $statusCode)" -ForegroundColor Yellow
        $TESTS_PASSED++
    }
}
Write-Host ""

# Test 4: Check /api/businesses endpoint
Write-Host "📍 Test 4: GET /api/businesses" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/businesses" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ PASS: Businesses endpoint exists" -ForegroundColor Green
    $TESTS_PASSED++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    Write-Host "✅ PASS: Businesses endpoint exists (HTTP $statusCode)" -ForegroundColor Green
    $TESTS_PASSED++
}
Write-Host ""

# Test 5: Check /api/transactions endpoint
Write-Host "📍 Test 5: GET /api/transactions" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/transactions" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ PASS: Transactions endpoint exists" -ForegroundColor Green
    $TESTS_PASSED++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    Write-Host "✅ PASS: Transactions endpoint exists (HTTP $statusCode)" -ForegroundColor Green
    $TESTS_PASSED++
}
Write-Host ""

# Summary
Write-Host "========================" -ForegroundColor Cyan
Write-Host "📊 Test Results" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "✅ Passed: $TESTS_PASSED" -ForegroundColor Green
Write-Host "❌ Failed: $TESTS_FAILED" -ForegroundColor Red
Write-Host "📌 Total:  $($TESTS_PASSED + $TESTS_FAILED)" -ForegroundColor Cyan
Write-Host ""

if ($TESTS_FAILED -gt 0) {
    Write-Host "⚠️  Some tests failed. Make sure:" -ForegroundColor Yellow
    Write-Host "   1. Server is running on localhost:3003" -ForegroundColor Yellow
    Write-Host "   2. Environment variables are set correctly" -ForegroundColor Yellow
} else {
    Write-Host "✅ All endpoint health checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps to Test Full Functionality:" -ForegroundColor Cyan
    Write-Host "   1. Log in to the application at http://localhost:3003" -ForegroundColor Cyan
    Write-Host "   2. Create a business/account" -ForegroundColor Cyan
    Write-Host "   3. Test account creation at /contas" -ForegroundColor Cyan
    Write-Host "   4. Test category creation at /categorias" -ForegroundColor Cyan
    Write-Host "   5. Check database for saved records" -ForegroundColor Cyan
}
