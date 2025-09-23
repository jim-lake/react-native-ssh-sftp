#!/bin/bash
set -e

cd "$(dirname "$0")"

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    # Kill any running adb logcat processes
    pkill -f "adb logcat" 2>/dev/null || true
    if [ ! -z "$LOGCAT_PID" ]; then
        kill $LOGCAT_PID 2>/dev/null || true
    fi
}

# Always cleanup on exit
trap cleanup EXIT INT TERM

echo "Starting SSH test server..."
cd tests
./start-test-server.sh

echo "Waiting for SSH server to be ready..."
sleep 3

echo "Starting Android tests with real-time logs..."
cd ../android

# Clear existing logs
adb logcat -c

# Start logcat in background to capture test logs
adb logcat -v time | grep --line-buffered -E "(System.out|TestRunner|SSHClient)" &
LOGCAT_PID=$!

# Give logcat a moment to start
sleep 2

# Run the tests with minimal gradle output
echo "Running tests..."
./gradlew app:connectedAndroidTest -q

# Give logs time to flush
sleep 3

# Explicitly cleanup before stopping server
cleanup

echo "Stopping SSH test server..."
cd ../tests
./stop-test-server.sh

echo "Android tests completed!"
