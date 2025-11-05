#!/bin/bash

# Socket.IO Test Script
# This script tests the Socket.IO server functionality

echo "🧪 Socket.IO Server Testing Guide"
echo "================================="
echo ""

# Check if server is running
echo "1. ✅ Checking if server is running..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "   ✅ Server is running on port 5000"
else
    echo "   ❌ Server is not running. Please start with: npm start"
    exit 1
fi

echo ""
echo "2. 🌐 Testing REST API endpoints..."

# Test login to get a fresh token
echo "   🔐 Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowboard.com","password":"admin123"}')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo "   ✅ Login successful"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    echo "   📝 Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Login failed"
    echo "   📄 Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "   📋 Testing boards endpoint..."
BOARDS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/boards \
  -H "Authorization: Bearer $TOKEN")

if [[ $BOARDS_RESPONSE == *"success"* ]]; then
    echo "   ✅ Boards API working"
    BOARD_ID=$(echo $BOARDS_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | grep -o '[^"]*$')
    echo "   📋 Found board: $BOARD_ID"
else
    echo "   ❌ Boards API failed"
    echo "   📄 Response: $BOARDS_RESPONSE"
fi

echo ""
echo "   📝 Testing tasks endpoint..."
TASKS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN")

if [[ $TASKS_RESPONSE == *"success"* ]]; then
    echo "   ✅ Tasks API working"
    TASK_COUNT=$(echo $TASKS_RESPONSE | grep -o '"_id"' | wc -l)
    echo "   📊 Found $TASK_COUNT tasks"
else
    echo "   ❌ Tasks API failed"
    echo "   📄 Response: $TASKS_RESPONSE"
fi

echo ""
echo "3. 🧪 Socket.IO Testing Options:"
echo "================================="
echo ""
echo "Option A: Browser Test (Recommended)"
echo "   1. Open: http://localhost:5000/socket-test.html"
echo "   2. Click 'Connect' to test Socket.IO"
echo "   3. Try joining boards, creating tasks, typing indicators"
echo "   4. Open multiple tabs to test real-time collaboration!"
echo ""
echo "Option B: Command Line Test"
echo "   Run: npx ts-node src/test/socketTest.ts"
echo "   (This will run automated Socket.IO tests)"
echo ""
echo "Option C: Manual Testing with Multiple Users"
echo "   1. Get different user tokens:"
echo "      - Admin: admin@flowboard.com / admin123"
echo "      - User1: john@flowboard.com / password123"
echo "      - User2: jane@flowboard.com / password123"
echo "   2. Open browser test page with different tokens"
echo "   3. Join same board and test real-time features"
echo ""
echo "🔧 Test Checklist:"
echo "=================="
echo "□ Connection authentication"
echo "□ Join/leave board rooms"
echo "□ Create tasks in real-time"
echo "□ Update tasks across users"
echo "□ Move tasks between columns"
echo "□ Typing indicators"
echo "□ User presence tracking"
echo "□ Error handling"
echo ""
echo "💡 Pro Tips:"
echo "============"
echo "• Check browser console for detailed Socket.IO logs"
echo "• Test with multiple browser tabs/windows"
echo "• Try invalid tokens to test authentication"
echo "• Monitor server console for Socket.IO events"
echo "• Test network disconnection/reconnection"
echo ""

# Extract useful test data
echo "🔍 Test Data Available:"
echo "======================"
echo "• Token: $TOKEN"
echo "• Board ID: $BOARD_ID"
echo "• Project ID: 690b1792668bfd902a0581e5"
echo "• Column IDs: 690b1793668bfd902a0581ed (To Do), 690b1793668bfd902a0581ee (In Progress)"
echo ""

echo "🎯 Ready to test! Choose an option above to start."