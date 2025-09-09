# React Native SSH SFTP - Amazon Q Development Guide

## Project Overview

This is a React Native library that provides SSH and SFTP client functionality for iOS and Android. The library wraps native SSH implementations:
- **iOS**: NMSSH library (jim-lake's fork)
- **Android**: JSch library (Matthias Wiedemann fork)

## Project Structure

```
react-native-ssh-sftp/
├── src/                          # TypeScript source code
│   └── sshclient.ts             # Main API implementation
├── ios/                         # iOS native implementation
│   ├── RNSSHClient.m           # React Native bridge
│   ├── RNSSHClient.h           # Header file
│   ├── SSHClient.m             # Native SSH client wrapper
│   └── SSHClient.h             # Header file
├── android/                     # Android native implementation
├── example/                     # Example React Native app
│   ├── App.tsx                 # Main example app
│   ├── tests/                  # Test infrastructure
│   │   ├── e2e/               # End-to-end tests using Detox
│   │   ├── ssh-keys/          # Test SSH keys
│   │   ├── test-data/         # Test files for SFTP
│   │   ├── docker-compose.yml # SSH test server
│   │   └── start-test-server.sh # Test server setup
│   └── package.json           # Example app dependencies
├── dist/                       # Compiled TypeScript output
└── package.json               # Main library package
```

## How to Run the Code

### Prerequisites
- Node.js >= 20
- React Native development environment
- For iOS: Xcode, iOS Simulator, `applesimutils`
- For Android: Android Studio, Android SDK, AVD named `Pixel_3a_API_30_x86`

### Library Development
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Lint code
npm run lint
```

### Example App
```bash
cd example

# Install dependencies
npm install

# Run on iOS
npm run ios

# Run on Android
npm run android

# Start Metro bundler
npm start
```

## Testing Infrastructure

### Test Server Setup
The project uses a Docker-based SSH server for testing:

```bash
cd example/tests

# Start SSH test server
./start-test-server.sh

# Stop SSH test server
./stop-test-server.sh
```

**Test Server Details:**
- Host: `127.0.0.1:2222`
- Username: `user`
- Password: `password`
- SSH keys: Located in `tests/ssh-keys/`
- Test data: Located in `tests/test-data/`

### End-to-End Tests

**Prerequisites for E2E Tests:**
1. SSH test server must be running (`./start-test-server.sh`)
2. iOS Simulator or Android Emulator must be available
3. Detox must be properly configured

**Running E2E Tests:**
```bash
cd example

# iOS E2E Tests
npm run e2e:build:ios    # Build app for testing
npm run e2e:test:ios     # Run tests

# Android E2E Tests
npm run e2e:build:android
npm run e2e:test:android
```

**Test Results (Current Status):**
- `auth-methods.test.js`: ✅ ALL 7 TESTS PASSING (46s total runtime)
  - Docker SSH password authentication: ✅ (7.3s)
  - RSA key authentication: ✅ (4.8s)
  - OpenSSH key authentication: ✅ (4.8s)
  - Encrypted RSA key authentication: ✅ (3.6s)
  - SFTP functionality: ✅ (5.8s)
  - Sign callback authentication: ✅ (6.8s)
  - Basic SSH functionality: ✅ (3.6s)
- `app.test.js`: ✅ Passing with proper alert handling
- `basic-app.test.js`: ✅ UI element visibility tests passing
- `simple-launch.test.js`: ✅ Basic app launch test passing

## API Architecture

### New API (Recommended)
The library provides a modern Promise-based API with separate connection and authentication:

```typescript
// 1. Connect to host
const client = await SSHClient.connect("host", 22, "username");

// 2. Authenticate (multiple methods available)
await client.authenticateWithPassword("password");
await client.authenticateWithKey(privateKey, passphrase?);
await client.authenticateWithSignCallback(publicKey, signCallback);

// 3. Check authentication
if (client.isAuthenticated()) {
  // Perform operations
}
```

### Legacy API (Deprecated)
```typescript
// Combined connection + authentication (deprecated)
const client = await SSHClient.connectWithPassword(host, port, username, password);
const client = await SSHClient.connectWithKey(host, port, username, privateKey, passphrase?);
```

### Authentication Methods Tested

1. **Password Authentication** (`D` button)
   - Connects to Docker SSH server with username/password
   - Test Status: ✅ PASSING (7.3s)

2. **RSA Key Authentication** (`R` button)
   - Uses embedded RSA private key
   - Test Status: ✅ PASSING (4.8s)

3. **OpenSSH Key Authentication** (`O` button)
   - Uses OpenSSH format private key
   - Test Status: ✅ PASSING (4.8s)

4. **Encrypted RSA Key Authentication** (`E` button)
   - Uses password-protected RSA key with passphrase
   - Test Status: ✅ PASSING (3.6s)

5. **SFTP Operations** (`F` button)
   - Connects via password, then establishes SFTP
   - Lists directory contents
   - Test Status: ✅ PASSING (5.8s)

6. **Sign Callback Authentication** (`C` button)
   - Uses public key with callback-based signing
   - Mock implementation for testing
   - Test Status: ✅ PASSING (6.8s)

7. **Basic SSH Test** (`S` button)
   - Tests connection to non-existent local SSH server
   - Expected result: "Native call successful (connection failed as expected)"
   - Test Status: ✅ PASSING (3.6s)

## Key Components

### SSHClient Class (TypeScript)
- **Location**: `src/sshclient.ts`
- **Purpose**: Main API interface, handles Promise wrapping of native calls
- **Key Methods**:
  - `connect()` - Establish connection
  - `authenticateWithPassword()` - Password auth
  - `authenticateWithKey()` - Key-based auth
  - `authenticateWithSignCallback()` - Callback-based signing
  - `execute()` - Run SSH commands
  - `connectSFTP()` - Establish SFTP session
  - `sftpLs()`, `sftpUpload()`, `sftpDownload()` - SFTP operations

### Native Bridge (iOS)
- **Location**: `ios/RNSSHClient.m`
- **Purpose**: React Native bridge to native NMSSH library
- **Key Features**:
  - Connection pooling with unique keys
  - Event emission for shell, progress, sign callbacks
  - Async operation handling with dispatch queues
  - Sign callback implementation with semaphores

### Example App (React Native)
- **Location**: `example/App.tsx`
- **Purpose**: Demonstrates all authentication methods
- **UI**: Compact interface with single-letter buttons (S,D,R,O,E,F,C)
- **Status Display**: Shows current operation status

## Test Preconditions

### For E2E Tests to Pass:
1. **SSH Test Server Running**: `./start-test-server.sh` must be executed
2. **Network Connectivity**: Local Docker container must be accessible on port 2222
3. **SSH Keys Present**: All test keys must exist in `tests/ssh-keys/`
4. **Test Data Available**: SFTP test files must exist in `tests/test-data/`
5. **Device/Simulator Ready**: iOS Simulator or Android Emulator running
6. **App Built**: `npm run e2e:build:ios` or `npm run e2e:build:android` completed

### Resolved Issues and Key Learnings:
- **ScrollView Rendering Problem**: RESOLVED - Root cause was compiled JavaScript files (App.js, App.js.map, App.d.ts) overriding TypeScript source code
- **Button Accessibility**: RESOLVED - Implemented proper ScrollView layout with 15px padding and 16px font size for better test accessibility
- **Comprehensive Testing**: All 7 authentication methods now pass E2E tests through actual button interactions
- **Critical Fix**: Always remove compiled JS files when making TypeScript changes to prevent source override issues
- **Test Strategy**: Functionality testing with proper alert handling and afterEach cleanup ensures robust sequential test execution

## How to Modify the Code

### Adding New Authentication Methods:
1. **TypeScript Interface**: Add method to `SSHClient` class in `src/sshclient.ts`
2. **Native Implementation**: Implement in `ios/RNSSHClient.m` and Android equivalent
3. **Example Usage**: Add button and handler in `example/App.tsx`
4. **Tests**: Add test case in `example/tests/e2e/auth-methods.test.js`

### Modifying Existing Features:
1. **API Changes**: Update TypeScript definitions and implementation
2. **Native Changes**: Modify bridge methods in native code
3. **Example Updates**: Update example app to demonstrate changes
4. **Test Updates**: Modify or add tests to cover new functionality

### Adding New SFTP Operations:
1. **TypeScript**: Add method to SSHClient class
2. **Native Bridge**: Implement RCT_EXPORT_METHOD in native code
3. **Testing**: Add test cases for new operations

## Build Process

### Library Build:
```bash
npm run compile  # TypeScript compilation to dist/
```

### Example App Build:
```bash
# iOS
cd example
npm run bundle  # Create React Native bundle
npm run e2e:build:ios  # Build iOS app for testing

# Android
npm run e2e:build:android  # Build Android APK
```

## Dependencies

### Main Library:
- **TypeScript**: For type-safe development
- **React Native**: Peer dependency
- **ESLint**: Code linting
- **cross-env**: Cross-platform environment variables

### Example App:
- **React Native 0.81.1**: Framework version
- **Detox**: E2E testing framework
- **Jest**: Test runner
- **Docker**: For SSH test server

### Native Dependencies:
- **iOS**: NMSSH (jim-lake's fork) via CocoaPods
- **Android**: JSch library

## Future Development Guidelines

### When Making Changes:
1. **Always run tests**: Ensure E2E tests pass after modifications
2. **Update documentation**: Keep README.md and this file current
3. **Test all auth methods**: Verify all 7 authentication methods work
4. **Check both platforms**: Test on both iOS and Android
5. **Maintain backward compatibility**: Don't break existing API usage
6. **Remove compiled files**: CRITICAL - Delete App.js, App.js.map, App.d.ts when modifying TypeScript to prevent override issues

### Common Pitfalls:
1. **Compiled File Override**: CRITICAL - Remove compiled JavaScript files (App.js, App.js.map, App.d.ts) when making TypeScript changes to prevent source override
2. **UI Rendering Issues**: Be aware of React Native rendering problems with complex layouts
3. **Async Timing**: SSH operations are async, ensure proper Promise handling
4. **Native Bridge**: Changes to native code require rebuilding the app
5. **Test Server**: E2E tests require the Docker SSH server to be running
6. **Key Management**: SSH keys must be properly formatted and accessible

This documentation provides the foundation for understanding and modifying the React Native SSH SFTP library effectively.
