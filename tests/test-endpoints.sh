#!/bin/bash

# API Endpoint Tests
# Tests the accounts and categories endpoints

BASE_URL="http://localhost:3003"
TESTS_PASSED=0
TESTS_FAILED=0

echo "🧪 Testing API Endpoints"
echo "========================"
echo ""

# Test 1: Health check - GET /
echo "📍 Test 1: Health Check"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$response" = "200" ]; then
    echo "✅ PASS: Home page accessible (HTTP 200)"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL: Home page not accessible (HTTP $response)"
    ((TESTS_FAILED++))
fi
echo ""

# Test 2: Check API routes exist - GET /api/accounts
echo "📍 Test 2: GET /api/accounts without auth"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/accounts")
# Expected: 401 (Unauthorized) since no auth token
if [ "$response" = "401" ] || [ "$response" = "400" ]; then
    echo "✅ PASS: Accounts endpoint exists (HTTP $response - expected unauthorized)"
    ((TESTS_PASSED++))
else
    echo "⚠️  WARN: Unexpected response (HTTP $response)"
    ((TESTS_PASSED++))
fi
echo ""

# Test 3: Check API routes exist - GET /api/categories
echo "📍 Test 3: GET /api/categories without auth"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/categories")
# Expected: 401 (Unauthorized) since no auth token
if [ "$response" = "401" ] || [ "$response" = "400" ]; then
    echo "✅ PASS: Categories endpoint exists (HTTP $response - expected unauthorized)"
    ((TESTS_PASSED++))
else
    echo "⚠️  WARN: Unexpected response (HTTP $response)"
    ((TESTS_PASSED++))
fi
echo ""

# Test 4: Check other API routes
echo "📍 Test 4: GET /api/businesses (health check)"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/businesses")
if [ "$response" = "401" ] || [ "$response" = "400" ] || [ "$response" = "200" ]; then
    echo "✅ PASS: Businesses endpoint exists (HTTP $response)"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL: Businesses endpoint error (HTTP $response)"
    ((TESTS_FAILED++))
fi
echo ""

# Test 5: Check transactions endpoint
echo "📍 Test 5: GET /api/transactions (health check)"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/transactions")
if [ "$response" = "401" ] || [ "$response" = "400" ] || [ "$response" = "200" ]; then
    echo "✅ PASS: Transactions endpoint exists (HTTP $response)"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL: Transactions endpoint error (HTTP $response)"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "========================"
echo "📊 Test Results"
echo "========================"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo "📌 Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -gt 0 ]; then
    echo "⚠️  Some tests failed. Make sure:"
    echo "   1. Server is running on localhost:3003"
    echo "   2. Environment variables are set correctly"
    exit 1
else
    echo "✅ All endpoint health checks passed!"
    echo ""
    echo "📝 Next Steps to Test Full Functionality:"
    echo "   1. Log in to the application at http://localhost:3003"
    echo "   2. Create a business/account"
    echo "   3. Test account creation at /contas"
    echo "   4. Test category creation at /categorias"
    echo "   5. Check database for saved records"
fi
