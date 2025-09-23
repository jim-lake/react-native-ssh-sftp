#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Starting SSH test server..."
cd ../example/tests
./start-test-server.sh

echo "Waiting for SSH server to be ready..."
sleep 3

echo "Running Android unit tests..."
cd ../android

# Run the SSH client unit tests
./gradlew app:connectedAndroidTest --tests="com.sshsftpexample.SSHClientUnitTest"

echo "Stopping SSH test server..."
cd ../tests
./stop-test-server.sh

echo "Android SSH client unit tests completed!"
