#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Starting SSH test server..."
cd tests
./start-test-server.sh

echo "Waiting for SSH server to be ready..."
sleep 3

echo "Running Android SSH client unit tests..."
cd ../android

# Run all connected Android tests (includes our SSH client unit tests)
./gradlew app:connectedAndroidTest

echo "Stopping SSH test server..."
cd ../tests
./stop-test-server.sh

echo "Android SSH client unit tests completed!"
echo "Test results available at: android/app/build/reports/androidTests/connected/debug/index.html"
