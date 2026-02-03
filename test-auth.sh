#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/tasks"
TOKEN="b8fa90188ad4afcf5acdab9b172c3ff659413b88915cd5f8f06e6aeeeb6031ed"

echo "🧪 Testing Kanban API Authentication"
echo "======================================"
echo ""

# Test 1: Without token (should fail)
echo "1️⃣  Testing WITHOUT token..."
echo "   URL: $API_URL"
echo "   Expected: 401 Unauthorized"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL)
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" = "401" ]; then
  echo -e "   ${GREEN}✅ PASS${NC} - Got 401 Unauthorized"
  echo "   Response: $BODY"
else
  echo -e "   ${RED}❌ FAIL${NC} - Got status $STATUS (expected 401)"
  echo "   Response: $BODY"
fi

echo ""
echo "---"
echo ""

# Test 2: With token (should work)
echo "2️⃣  Testing WITH token..."
echo "   URL: $API_URL"
echo "   Authorization: Bearer $TOKEN"
echo "   Expected: 200 OK"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" $API_URL)
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" = "200" ]; then
  echo -e "   ${GREEN}✅ PASS${NC} - Got 200 OK"
  TASK_COUNT=$(echo "$BODY" | grep -o '"id":' | wc -l)
  echo "   Response: Array with $TASK_COUNT tasks"
else
  echo -e "   ${RED}❌ FAIL${NC} - Got status $STATUS (expected 200)"
  echo "   Response: $BODY"
fi

echo ""
echo "======================================"
