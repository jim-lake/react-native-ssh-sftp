# SSH SFTP Example App

This is a minimal React Native example app that demonstrates the usage of the `@dylankenneally/react-native-ssh-sftp` library.

## Features

- Imports the SSH SFTP library successfully
- Calls native SSH connection function to verify the module is working
- Compiles and runs on iOS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS pods:
```bash
cd ios && pod install && cd ..
```

3. Run on iOS:
```bash
npx react-native run-ios
```

## Usage

The app displays a simple interface with a "Test SSH Connection" button. When pressed, it attempts to connect to localhost using dummy credentials. The connection will fail (as expected), but this proves that the native SSH module is properly integrated and working.

## Note

This example is designed to test the native module integration. For actual SSH connections, you would need to provide valid server credentials and connection details.
