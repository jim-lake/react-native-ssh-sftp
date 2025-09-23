#!/bin/bash
set -e

cd "$(dirname "$0")"

SSH_OPTS="-p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o BatchMode=yes -o PasswordAuthentication=no"
HOST="user@127.0.0.1"
TEST_CMD="echo 'Connection successful'"

echo "Testing SSH connections to test server..."

# Test password authentication (using sshpass to avoid interactive input)
echo "1. Testing password authentication..."
if command -v sshpass >/dev/null 2>&1; then
    if sshpass -p 'password' ssh -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o PubkeyAuthentication=no "$HOST" "$TEST_CMD" 2>/dev/null; then
        echo "   ✓ Password authentication: SUCCESS"
    else
        echo "   ✗ Password authentication: FAILED"
    fi
else
    echo "   - Password authentication: SKIPPED (sshpass not installed)"
fi

# Test all SSH keys
echo "2. Testing SSH key authentication..."

for key_file in ssh-keys/id_*; do
    # Skip .pub files and files with extensions
    if [[ "$key_file" == *.pub ]] || [[ "$key_file" == *.pem ]] || [[ "$key_file" == *.pk8 ]]; then
        continue
    fi
    
    key_name=$(basename "$key_file")
    
    if [[ "$key_name" == "id_rsa_pem" ]]; then
        # Handle encrypted key with expect
        if command -v expect >/dev/null 2>&1; then
            if expect -c "
                spawn ssh -i $key_file $SSH_OPTS $HOST \"$TEST_CMD\"
                expect \"Enter passphrase for key*\" { send \"password\r\" }
                expect eof
            " 2>/dev/null | grep -q "Connection successful"; then
                echo "   ✓ Key $key_name (encrypted): SUCCESS"
            else
                echo "   ✗ Key $key_name (encrypted): FAILED"
            fi
        else
            echo "   - Key $key_name: SKIPPED (expect not installed)"
        fi
    else
        if ssh -i "$key_file" $SSH_OPTS "$HOST" "$TEST_CMD" 2>/dev/null; then
            echo "   ✓ Key $key_name: SUCCESS"
        else
            echo "   ✗ Key $key_name: FAILED"
        fi
    fi
done

# Test SFTP functionality
echo "3. Testing SFTP functionality..."
if echo "ls" | sftp -i ssh-keys/id_rsa_nopass -P 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o BatchMode=yes -o PasswordAuthentication=no "$HOST" >/dev/null 2>&1; then
    echo "   ✓ SFTP connection: SUCCESS"
else
    echo "   ✗ SFTP connection: FAILED"
fi

# Test file operations
echo "4. Testing file operations..."
if ssh -i ssh-keys/id_rsa_nopass $SSH_OPTS "$HOST" "ls -la /var/www/nmssh-tests/valid/listing/" 2>/dev/null | grep -q "d.txt"; then
    echo "   ✓ Test files exist: SUCCESS"
else
    echo "   ✗ Test files exist: FAILED"
fi

echo "Connection testing complete."
