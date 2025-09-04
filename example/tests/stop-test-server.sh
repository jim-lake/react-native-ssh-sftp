#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Stopping SSH test server..."
docker stop nmssh-test-ssh
docker rm nmssh-test-ssh
