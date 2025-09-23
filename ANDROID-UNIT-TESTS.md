# Android Unit Tests

Unit tests for Android SSH client library verifying `connectToHost` and `authenticateWithPassword` functionality.

## Status

✅ **ALL TESTS WORKING** - 7 tests passing with 100% success rate

## Prerequisites

- Android emulator or device connected
- SSH test server running on `127.0.0.1:2222`

## Run Tests with Real-Time Logs

```bash
cd example
./run-android-tests-with-logs.sh
```

This script will:
1. Start the SSH test server
2. Run Android tests with real-time log output
3. Stop the SSH test server
4. Show all test logs including connection details

## Test Results

✅ **7 tests passing** (100% success rate)

The tests output detailed logs showing:
- Server connection details (127.0.0.1:2222)
- Username and password being used
- Success status for each test
- Connection and disconnection events

### Sample Log Output:
```
=== SSH CONNECTION TEST ===
Connecting to: 127.0.0.1:2222
Username: user
Password: password
SUCCESS: Connected to SSH server 127.0.0.1:2222 with user user
Disconnected from SSH server

=== SSH PASSWORD AUTH SUCCESS TEST ===
Server: 127.0.0.1:2222
Username: user
Password: password
Expected: Authentication should succeed
SUCCESS: Authenticated with correct password for user user on 127.0.0.1:2222
Disconnected from SSH server
```

## Test Coverage

- **testConnectToHost** - SSH connection establishment ✅
- **testAuthenticateWithPasswordSuccess** - Password authentication success ✅
- **testSSHClientModuleExists** - Module availability verification ✅
- **testJSchLibraryExists** - JSch library verification ✅
- **testBasicJavaFunctionality** - Basic test framework ✅
- Plus 2 additional working tests from existing test suite ✅

## Test Files

- `example/android/app/src/androidTest/java/com/sshsftpexample/SSHClientDirectTest.java`
- `example/android/app/src/androidTest/java/com/sshsftpexample/SimpleSSHTest.java`
- `example/run-android-tests-with-logs.sh` - Test runner script
