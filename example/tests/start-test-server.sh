#!/bin/bash

cd "$(dirname "$0")"

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker stop nmssh-test-ssh 2>/dev/null || true
docker rm nmssh-test-ssh 2>/dev/null || true

# Clean up SSH known hosts to avoid conflicts
ssh-keygen -R "[127.0.0.1]:2222" 2>/dev/null || true

echo "Starting SSH test server..."
docker run -d --name nmssh-test-ssh \
  -p 2222:22 \
  -e SSH_USERS=user:1000:1000 \
  -e SSH_ENABLE_PASSWORD_AUTH=true \
  -v "$(pwd)/ssh-keys:/tmp/ssh-keys:ro" \
  -v "$(pwd)/test-data:/tmp/test-data:ro" \
  panubo/sshd:1.1.0 \
  sh -c "
    # Set up user and keys BEFORE starting SSH server
    echo 'user:password' | chpasswd
    mkdir -p /home/user/.ssh
    cp /tmp/ssh-keys/authorized_keys /home/user/.ssh/authorized_keys
    chown -R user:user /home/user/.ssh
    chmod 700 /home/user/.ssh
    chmod 600 /home/user/.ssh/authorized_keys
    
    # Set up test data
    mkdir -p /var/www/nmssh-tests/valid/listing /var/www/nmssh-tests/invalid
    cp -r /tmp/test-data/* /var/www/nmssh-tests/
    echo 'test content' > /var/www/nmssh-tests/valid/listing/d.txt
    echo 'test content' > /var/www/nmssh-tests/valid/listing/e.txt
    echo 'test content' > /var/www/nmssh-tests/valid/listing/f.txt
    mkdir -p /var/www/nmssh-tests/valid/listing/a /var/www/nmssh-tests/valid/listing/b /var/www/nmssh-tests/valid/listing/c
    chown -R user:user /var/www/nmssh-tests
    chmod -R 755 /var/www/nmssh-tests/valid
    chmod -R 555 /var/www/nmssh-tests/invalid
    
    # Now start SSH server
    /usr/sbin/sshd -D
  "

echo "Waiting for SSH server to be ready..."
# Wait for container to be running
sleep 3

# Wait for SSH server to be accepting connections
for i in {1..30}; do
    if nc -z 127.0.0.1 2222 2>/dev/null; then
        echo "SSH server is accepting connections"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "SSH server failed to start"
        docker logs nmssh-test-ssh
        exit 1
    fi
    sleep 1
done

# Additional wait for SSH server to be fully initialized
sleep 5

# Test SSH connectivity before running tests
echo "Testing SSH connectivity..."
for i in {1..10}; do
    SSH_TEST_OUTPUT=$(ssh -i ssh-keys/id_rsa_nopass -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 -o PasswordAuthentication=no user@127.0.0.1 "echo 'SSH test successful'" 2>&1)
    if [[ "$SSH_TEST_OUTPUT" == *"SSH test successful"* ]]; then
        echo "SSH connectivity test passed"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "SSH connectivity test failed after 10 attempts:"
        echo "$SSH_TEST_OUTPUT"
        echo "Checking server logs..."
        docker logs nmssh-test-ssh | tail -20
        exit 1
    fi
    echo "SSH test attempt $i failed, retrying in 2 seconds..."
    sleep 2
done

