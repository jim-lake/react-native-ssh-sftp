# Android Unit Tests for SSH Client

This directory contains unit tests for the Android SSH client library to verify `connectToHost` and `authenticateWithPassword` functionality.

## Test Structure

### Integration Tests (Instrumentation Tests)
Located in: `example/android/app/src/androidTest/java/com/sshsftpexample/`

#### SSHClientUnitTest.java
Tests the actual SSH client functionality using the same test target as the example:

1. **testConnectToHost** - Tests successful connection to SSH server
2. **testConnectToHostInvalidHost** - Tests connection failure to invalid host  
3. **testAuthenticateWithPasswordSuccess** - Tests successful password authentication
4. **testAuthenticateWithPasswordFailure** - Tests authentication failure with wrong password

#### SimpleSSHTest.java  
Basic tests that verify the test infrastructure:

1. **testSSHClientModuleExists** - Verifies SSH client module class is available
2. **testJSchLibraryExists** - Verifies JSch library dependency is available
3. **testBasicJavaFunctionality** - Basic test framework verification

### Test Dependencies Added

The following dependencies were added to support unit testing:

```gradle
// In android/build.gradle
testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
testImplementation 'junit:junit:4.13.2'
testImplementation 'org.mockito:mockito-core:4.6.1'
androidTestImplementation 'androidx.test.ext:junit:1.1.5'
androidTestImplementation 'androidx.test:runner:1.5.2'
androidTestImplementation 'androidx.test:rules:1.5.0'

// In example/android/app/build.gradle  
testImplementation 'junit:junit:4.13.2'
testImplementation 'org.mockito:mockito-core:4.6.1'
androidTestImplementation 'junit:junit:4.13.2'
androidTestImplementation 'androidx.test.ext:junit:1.1.5'
androidTestImplementation 'androidx.test:runner:1.5.2'
androidTestImplementation 'androidx.test:rules:1.5.0'
androidTestImplementation 'androidx.test.uiautomator:uiautomator:2.2.0'
androidTestImplementation 'org.mockito:mockito-android:4.6.1'
```

## Running the Tests

### Prerequisites
1. SSH test server must be running (uses same server as E2E tests)
2. Android emulator or device must be connected
3. Example app must be built

### Test Scripts

#### Run SSH Client Unit Tests
```bash
cd example
./run-ssh-unit-tests.sh
```

This script:
1. Starts the SSH test server using Docker
2. Runs the Android instrumentation tests
3. Stops the SSH test server
4. Reports test results

#### Manual Test Execution
```bash
# Start SSH server
cd example/tests
./start-test-server.sh

# Run tests
cd ../android
./gradlew app:connectedAndroidTest

# Stop SSH server  
cd ../tests
./stop-test-server.sh
```

#### Compilation Test (No Emulator Required)
```bash
cd example/android
./gradlew app:compileDebugAndroidTestJavaWithJavac
```

## Test Implementation Details

### SSH Server Configuration
The tests use the same SSH server configuration as the E2E tests:
- Host: `127.0.0.1:2222`
- Username: `user`
- Password: `password`
- Docker container: `nmssh-test-ssh`

### Test Approach
- Uses Android instrumentation testing framework
- Mocks ReactApplicationContext using Mockito
- Tests actual SSH client module functionality
- Verifies both success and failure scenarios
- Uses CountDownLatch for async callback handling

### Test Coverage
✅ **connectToHost** - Connection establishment  
✅ **authenticateWithPassword** - Password authentication (success/failure)  
✅ **Error handling** - Invalid host connection attempts  
✅ **Async operations** - Proper callback handling with timeouts
✅ **Module availability** - SSH client and JSch library verification
✅ **Test infrastructure** - Basic test framework functionality

## Current Status

### ✅ Completed
- Unit test infrastructure setup
- Test dependencies configuration  
- SSH client module tests (connectToHost, authenticateWithPassword)
- Basic infrastructure verification tests
- Test compilation verification
- Test runner scripts
- Documentation

### ⚠️ Known Limitations
- Full SSH client tests require Android emulator/device to run
- React Native context mocking has some limitations in unit test environment
- Tests are designed as instrumentation tests rather than pure unit tests

### 🔧 Test Infrastructure
- **Compilation**: ✅ All tests compile successfully
- **Dependencies**: ✅ All required libraries available
- **Test Framework**: ✅ Android instrumentation testing configured
- **SSH Server Integration**: ✅ Uses same Docker server as E2E tests

## Integration with Existing Test Infrastructure

These unit tests complement the existing test infrastructure:

- **E2E Tests**: Full application testing with UI automation (18 tests passing)
- **Unit Tests**: Direct module testing without UI dependencies (6 tests created)
- **Shared Test Server**: Same Docker SSH server used by both test types
- **Consistent Test Data**: Uses same SSH credentials and configuration

## Test Results Location

Test results are available at:
```
example/android/app/build/reports/androidTests/connected/debug/index.html
```

## Files Created

### Test Files
- `example/android/app/src/androidTest/java/com/sshsftpexample/SSHClientUnitTest.java`
- `example/android/app/src/androidTest/java/com/sshsftpexample/SimpleSSHTest.java`
- `example/android/app/src/test/java/com/sshsftpexample/SSHClientBasicTest.java`

### Scripts
- `android/run-unit-tests.sh`
- `example/run-ssh-unit-tests.sh`

### Documentation
- `android/README-UNIT-TESTS.md`

## Notes

- Tests require an Android emulator or device to be running for full execution
- SSH server must be accessible on localhost:2222 for SSH functionality tests
- Tests verify the actual JSch SSH implementation on Android
- Timeout set to 10 seconds per test operation
- Tests use the same authentication methods as the main application
- Simple tests can be compiled without emulator to verify test infrastructure
