#!/bin/bash

# Simple test script for Startup Profiles API
# Run with: ./test-startup-api.sh

BASE_URL="http://localhost:3001/api/v1/startups"
USER_ID="test-user-$(date +%s)"

echo "🚀 Testing Startup Profiles & Discovery API"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Server Health Check${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✅ Server is running${NC}"
else
  echo -e "${RED}❌ Server is not responding (HTTP $response)${NC}"
  exit 1
fi
echo ""

# Test 2: Get Trending Startups
echo -e "${YELLOW}Test 2: Get Trending Startups${NC}"
response=$(curl -s "$BASE_URL/discovery/trending" -H "x-user-id: $USER_ID")
count=$(echo $response | grep -o '"startups"' | wc -l)
if [ $count -gt 0 ]; then
  echo -e "${GREEN}✅ Trending startups endpoint working${NC}"
  echo "Response: $(echo $response | head -c 100)..."
else
  echo -e "${RED}❌ Failed to get trending startups${NC}"
fi
echo ""

# Test 3: Search Startups
echo -e "${YELLOW}Test 3: Search Startups${NC}"
response=$(curl -s "$BASE_URL/discovery/search?query=tech" -H "x-user-id: $USER_ID")
if echo $response | grep -q "success"; then
  echo -e "${GREEN}✅ Search endpoint working${NC}"
else
  echo -e "${RED}❌ Search endpoint failed${NC}"
fi
echo ""

# Test 4: Get Facets
echo -e "${YELLOW}Test 4: Get Search Facets${NC}"
response=$(curl -s "$BASE_URL/discovery/facets" -H "x-user-id: $USER_ID")
if echo $response | grep -q "facets"; then
  echo -e "${GREEN}✅ Facets endpoint working${NC}"
else
  echo -e "${RED}❌ Facets endpoint failed${NC}"
fi
echo ""

# Test 5: Create Test Startup (if needed)
echo -e "${YELLOW}Test 5: Create Test Startup${NC}"
response=$(curl -s -X POST "$BASE_URL" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Startup Inc",
    "description": "A test startup for API validation",
    "industry": "Technology",
    "stage": "seed",
    "location": "San Francisco"
  }')

startup_id=$(echo $response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$startup_id" ]; then
  echo -e "${GREEN}✅ Created test startup: $startup_id${NC}"
  
  # Test 6: Add Team Member
  echo ""
  echo -e "${YELLOW}Test 6: Add Team Member${NC}"
  response=$(curl -s -X POST "$BASE_URL/profiles/$startup_id/team" \
    -H "x-user-id: $USER_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "John Doe",
      "role": "CEO",
      "bio": "Experienced entrepreneur",
      "isFounder": true
    }')
  
  if echo $response | grep -q "success"; then
    echo -e "${GREEN}✅ Team member added${NC}"
  else
    echo -e "${RED}❌ Failed to add team member${NC}"
  fi
  
  # Test 7: Follow Startup
  echo ""
  echo -e "${YELLOW}Test 7: Follow Startup${NC}"
  response=$(curl -s -X POST "$BASE_URL/profiles/$startup_id/follow" \
    -H "x-user-id: $USER_ID")
  
  if echo $response | grep -q "success"; then
    echo -e "${GREEN}✅ Successfully followed startup${NC}"
  else
    echo -e "${RED}❌ Failed to follow startup${NC}"
  fi
  
  # Test 8: Get Startup Profile
  echo ""
  echo -e "${YELLOW}Test 8: Get Startup Profile${NC}"
  response=$(curl -s "$BASE_URL/profiles/$startup_id" -H "x-user-id: $USER_ID")
  
  if echo $response | grep -q "Test Startup Inc"; then
    echo -e "${GREEN}✅ Retrieved startup profile${NC}"
  else
    echo -e "${RED}❌ Failed to get startup profile${NC}"
  fi
else
  echo -e "${RED}❌ Failed to create test startup${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Testing Complete!${NC}"
echo ""
echo "Tips:"
echo "- Check server logs for detailed error messages"
echo "- Ensure database migrations are applied"
echo "- Verify all services are running"
