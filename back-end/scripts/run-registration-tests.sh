#!/bin/bash

# Script to run registration flow integration tests

echo "🧪 Running Registration Flow Integration Tests"
echo "================================================"

# Check if test environment is set up
if [ ! -f .env.test ]; then
    echo "❌ Test environment not set up. Running setup first..."
    npm run test:setup
fi

# Run registration tests
echo "Running registration flow tests..."
npm run test:e2e -- --testNamePattern="Registration Flows"

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All registration flow tests passed!"
    echo ""
    echo "Test Summary:"
    echo "- Phone Number Registration Flow ✓"
    echo "- Complete Profile Flow ✓"
    echo "- Set Password Flow ✓"
    echo "- Login Flow ✓"
    echo "- Account Unlock Flow ✓"
    echo "- Token Refresh Flow ✓"
    echo "- Logout Flow ✓"
    echo "- Profile Management Flow ✓"
    echo "- Error Handling and Edge Cases ✓"
else
    echo ""
    echo "❌ Some registration flow tests failed!"
    echo "Check the output above for details."
    exit 1
fi 