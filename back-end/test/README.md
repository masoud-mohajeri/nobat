# Integration Tests

This directory contains comprehensive integration tests for the Nobat booking system.

## Test Files

- `registration.e2e-spec.ts` - Registration flow integration tests
- `test-helper.ts` - Test utilities and helper functions
- `app.e2e-spec.ts` - Basic app health check tests

## Prerequisites

Before running the integration tests, ensure you have:

1. **PostgreSQL Database**: A test database should be available
2. **Redis**: Redis server should be running
3. **Environment Variables**: Set up test environment variables

## Test Environment Setup

Create a `.env.test` file in the root directory with the following configuration:

```env
# Test Environment Configuration
NODE_ENV=test
PORT=3001

# Test Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nobat_user
DB_PASSWORD=nobat_password
DB_DATABASE=nobat_db_test

# Test Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=nobat_redis_password
REDIS_DB=1

# Test JWT Configuration
JWT_SECRET=test_jwt_secret_key_2024
JWT_REFRESH_SECRET=test_refresh_secret_key_2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Test OTP Configuration
OTP_EXPIRES_IN=300

# Test Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Test File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./test-uploads

# Test SMS Service (mock for testing)
SMS_PROVIDER=mock
SMS_API_KEY=test_sms_api_key
SMS_API_SECRET=test_sms_api_secret

# Test Logging
LOG_LEVEL=error
LOG_FILE=./test-logs/app.log

# Test Security
CORS_ORIGIN=http://localhost:3001
```

## Database Setup

Create a test database:

```sql
CREATE DATABASE nobat_db_test;
```

## Running Tests

### Run All Integration Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npm run test:e2e -- --testNamePattern="Registration Flows"
```

### Run Tests in Watch Mode

```bash
npm run test:e2e -- --watch
```

### Run Tests with Coverage

```bash
npm run test:e2e -- --coverage
```

## Test Structure

### Registration Flow Tests

The `registration.e2e-spec.ts` file tests the following scenarios:

1. **Phone Number Registration Flow**
   - Send OTP for phone verification
   - Verify OTP and create user
   - Handle invalid OTP attempts
   - Handle expired OTP

2. **Complete Profile Flow**
   - Complete user profile with valid data
   - Handle invalid profile data
   - Handle unauthorized access

3. **Set Password Flow**
   - Set password successfully
   - Handle weak passwords
   - Handle unauthorized access

4. **Login Flow**
   - Login with password
   - Login with OTP
   - Handle invalid credentials
   - Handle non-existent users

5. **Account Unlock Flow**
   - Lock account after failed attempts
   - Send unlock OTP
   - Unlock account with OTP
   - Allow login after unlock

6. **Token Refresh Flow**
   - Refresh access token
   - Handle invalid refresh tokens
   - Handle expired refresh tokens

7. **Logout Flow**
   - Logout successfully
   - Handle unauthorized logout

8. **Profile Management Flow**
   - Get user profile
   - Handle unauthorized access

9. **Error Handling and Edge Cases**
   - Rate limiting
   - Concurrent OTP verification
   - Malformed JSON requests
   - Missing required fields

## Test Helper Functions

The `test-helper.ts` file provides utility functions:

- `createTestApp()` - Create test application instance
- `generateTestPhoneNumber()` - Generate unique test phone numbers
- `createVerifiedUser()` - Create a user with verified phone
- `createActiveUser()` - Create a fully active user with tokens
- `cleanupTestData()` - Clean up test data
- `closeTestApp()` - Close test application

## Mock OTP for Testing

In the test environment, OTP codes are mocked to `123456` for all OTP types. This allows tests to run without requiring actual SMS services.

## Test Data Cleanup

Tests automatically clean up data between test suites to ensure isolation. The database schema is dropped and recreated for each test run.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env.test`
   - Verify test database exists

2. **Redis Connection Error**
   - Ensure Redis is running
   - Check Redis configuration in `.env.test`

3. **Port Already in Use**
   - Change the test port in `.env.test`
   - Ensure no other services are using the test port

4. **Test Timeout**
   - Increase Jest timeout in `jest-e2e.json`
   - Check for slow database queries

### Debug Mode

Run tests in debug mode:

```bash
npm run test:debug
```

This will pause execution and allow you to inspect the application state.

## Adding New Tests

When adding new integration tests:

1. Follow the existing test structure
2. Use the `TestHelper` class for common operations
3. Clean up test data after each test
4. Use descriptive test names
5. Test both success and failure scenarios
6. Include edge cases and error conditions
