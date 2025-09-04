# E2E Tests

This directory contains Detox end-to-end tests for the SSH SFTP example app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. For iOS testing, install Detox CLI globally:
   ```bash
   npm install -g detox-cli
   ```

## Running Tests

### iOS
```bash
npm run e2e:build:ios
npm run e2e:test:ios
```

### Android
```bash
npm run e2e:build:android
npm run e2e:test:android
```

## Prerequisites

- **iOS**: Xcode and iOS Simulator
- **Android**: Android Studio, Android SDK, and an AVD named `Pixel_3a_API_30_x86`

You can create the required AVD using Android Studio's AVD Manager or via command line.
