# React Native SSH SFTP - Callback Authentication Documentation

## Overview

Callback authentication allows you to implement custom signing logic for SSH authentication without exposing private keys to the React Native layer. This is particularly useful for:

- Hardware security modules (HSM)
- Secure enclaves
- Custom cryptographic implementations
- Key management systems

## API Usage

### Basic Authentication Flow

```typescript
import SSHClient from '@dylankenneally/react-native-ssh-sftp';

// 1. Connect to host
const client = await SSHClient.connect("host.example.com", 22, "username");

// 2. Extract base64 public key from OpenSSH format
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const publicKey = opensshKey.split(' ')[1]; // Extract middle part

// 3. Define sign callback
const signCallback = async (data: string): Promise<string> => {
  // Decode the message to be signed
  const message = Buffer.from(data, 'base64');
  
  // Sign the message according to algorithm specification
  const signatureBytes = await signMessage(message, privateKey);
  
  // Return base64-encoded signature
  return signatureBytes.toString('base64');
};

// 4. Authenticate
await client.authenticateWithSignCallback(publicKey, signCallback);

// 5. Use authenticated client
if (client.isAuthenticated()) {
  const result = await client.execute("ls -la");
}
```

### Legacy API (Deprecated)

```typescript
// Extract base64 public key from OpenSSH format
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const publicKey = opensshKey.split(' ')[1];

// Combined connection + authentication (deprecated)
const client = await SSHClient.connectWithSignCallback(
  "host.example.com", 
  22, 
  "username", 
  publicKey, 
  signCallback
);
```

## Sign Callback Function

### Function Signature

```typescript
type SignCallback = (data: string) => Promise<string>;
```

### Parameters

#### Input: `data` (string)
- Base64-encoded challenge data from the SSH server
- This is the raw bytes that need to be signed
- No additional hashing or framing is required

#### Return Value: `signature` (string)
- Base64-encoded signature
- Format depends on the key type used
- Must match the algorithm specified in the public key

### Public Key Format

The `publicKey` parameter must be the **base64-encoded SSH wire format public key blob** - this is the middle section of an OpenSSH public key file.

**IMPORTANT**: For RSA keys, the algorithm identifier in the SSH wire format determines the signature algorithm:
- `ssh-rsa` → RSA-SHA1 signatures
- `rsa-sha2-256` → RSA-SHA256 signatures  
- `rsa-sha2-512` → RSA-SHA512 signatures

#### RSA Key Files vs Authentication Parameter

**RSA public key files** (like `id_rsa.pub` and `authorized_keys`) always use `ssh-rsa`:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host
```

**For RSA-SHA256 authentication**, you must modify the SSH wire format to specify `rsa-sha2-256`:

```typescript
// 1. Start with standard RSA public key
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const originalKey = opensshKey.split(' ')[1];

// 2. Decode and modify SSH wire format
const keyBytes = forge.util.decode64(originalKey);
// Parse: [alg_len][algorithm][e_len][e][n_len][n]
// Replace "ssh-rsa" with "rsa-sha2-256" and update length bytes

// 3. Use modified key for SHA256 authentication
await client.authenticateWithSignCallback(modifiedPublicKey, sha256SignCallback);
```

#### What happens internally:

1. **JavaScript layer**: You pass the base64 string with algorithm identifier
2. **Native iOS layer**: Converts to NSData using `initWithBase64EncodedString`
3. **NMSSH library**: Receives the SSH wire format binary data
4. **SSH protocol**: Uses algorithm identifier to determine signature type

#### Code example for RSA-SHA1 (standard):

```typescript
// Standard RSA-SHA1 authentication
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const publicKey = opensshKey.split(' ')[1]; // Uses ssh-rsa → SHA1 signatures
await client.authenticateWithSignCallback(publicKey, sha1SignCallback);
```

#### Code example for RSA-SHA256:

```typescript
// RSA-SHA256 authentication requires wire format modification
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const originalKey = opensshKey.split(' ')[1];

// Modify SSH wire format to specify rsa-sha2-256
const modifiedKey = modifyRSAKeyForSHA256(originalKey); // See implementation above
await client.authenticateWithSignCallback(modifiedKey, sha256SignCallback);
```

## Signature Format Requirements

### What the Sign Callback Receives and Returns

#### Input: `data` parameter
- **Format**: Base64-encoded string
- **Content**: Message to be signed (not a pre-hashed digest)
- **Decoding**: Use `Buffer.from(data, 'base64')` to get raw message bytes
- **Important**: This is the message that should be signed according to the algorithm's specification

#### Return Value: signature
- **Format**: Base64-encoded string  
- **Content**: Raw signature bytes (format depends on key type)
- **Encoding**: Use `signature.toString('base64')` to encode

### Data Flow Example

```typescript
const signCallback = async (data: string): Promise<string> => {
  // 1. Decode the base64 challenge data
  const challengeBytes = Buffer.from(data, 'base64');
  
  // 2. Sign the raw bytes (implementation depends on key type)
  const signatureBytes = await signData(challengeBytes, privateKey);
  
  // 3. Return base64-encoded signature
  return signatureBytes.toString('base64');
};
```

### Internal Processing

1. **JavaScript → Native**: Your callback returns base64 signature string
2. **Native processing**: `initWithBase64EncodedString` converts to NSData
3. **NMSSH library**: Receives raw signature bytes
4. **SSH protocol**: Uses signature for authentication

## SSH Wire Format Specification

### What is SSH Wire Format?

SSH wire format is the binary encoding used by the SSH protocol for transmitting structured data. For this library's callback authentication, you need to understand two specific uses:

#### 1. Public Key Wire Format (Input)
The `publicKey` parameter contains the SSH wire format public key blob, base64-encoded. This is the binary representation of the public key as used in the SSH protocol.

**Structure for RSA keys**:
```
[4 bytes: length of "ssh-rsa"][7 bytes: "ssh-rsa"]
[4 bytes: length of e][variable: e (public exponent)]  
[4 bytes: length of n][variable: n (modulus)]
```

**Structure for RSA-SHA2-256 keys**:
```
[4 bytes: length of "rsa-sha2-256"][12 bytes: "rsa-sha2-256"]
[4 bytes: length of e][variable: e (public exponent)]  
[4 bytes: length of n][variable: n (modulus)]
```

**Structure for ECDSA P-256 keys**:
```
[4 bytes: length of "ecdsa-sha2-nistp256"][19 bytes: "ecdsa-sha2-nistp256"]
[4 bytes: length of "nistp256"][8 bytes: "nistp256"]
[4 bytes: length of Q][65 bytes: Q (public point)]
```

**Structure for Ed25519 keys**:
```
[4 bytes: length of "ssh-ed25519"][11 bytes: "ssh-ed25519"]
[4 bytes: length of key][32 bytes: public key]
```

#### 2. ECDSA Signature Wire Format (Output)

For ECDSA signatures only, you must return the signature in SSH wire format:

```
[4 bytes: 0x00000021][1 byte: 0x00][32 bytes: r component]
[4 bytes: 0x00000021][1 byte: 0x00][32 bytes: s component]  
```

**Critical details**:
- Length prefix is `0x00000021` (33 in big-endian) for each component
- Each component starts with a zero byte (0x00) followed by 32 bytes
- Total component size: 33 bytes (1 zero byte + 32 data bytes)
- If r or s is shorter than 32 bytes, pad with leading zeros
- If r or s is longer than 32 bytes, remove leading zero bytes

**Example conversion from ASN.1 DER**:
```typescript
function convertASN1ToSSHWireFormat(asn1Signature: Buffer): Buffer {
  // Parse ASN.1: SEQUENCE { INTEGER r, INTEGER s }
  let offset = 2; // Skip SEQUENCE tag and length
  
  // Parse r
  const rTag = asn1Signature[offset++]; // Should be 0x02 (INTEGER)
  const rLength = asn1Signature[offset++];
  let r = asn1Signature.slice(offset, offset + rLength);
  offset += rLength;
  
  // Parse s  
  const sTag = asn1Signature[offset++]; // Should be 0x02 (INTEGER)
  const sLength = asn1Signature[offset++];
  let s = asn1Signature.slice(offset, offset + sLength);
  
  // Remove leading zeros, then pad to 32 bytes
  while (r.length > 1 && r[0] === 0x00) r = r.slice(1);
  while (s.length > 1 && s[0] === 0x00) s = s.slice(1);
  
  const rPadded = Buffer.alloc(32);
  const sPadded = Buffer.alloc(32);
  r.copy(rPadded, 32 - r.length);
  s.copy(sPadded, 32 - s.length);
  
  // Build SSH wire format: [length][0x00][32 bytes] for each component
  return Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x21]), // r length (33 bytes)
    Buffer.from([0x00]), // leading zero
    rPadded,
    Buffer.from([0x00, 0x00, 0x00, 0x21]), // s length (33 bytes)
    Buffer.from([0x00]), // leading zero
    sPadded
  ]);
}
```

### Why These Formats Matter

1. **Public Key**: The native NMSSH library expects the exact SSH wire format binary data
2. **RSA/Ed25519 Signatures**: Return raw signature bytes (no special formatting)
3. **ECDSA Signatures**: Must convert to SSH wire format because most crypto libraries return ASN.1 DER format

### Debugging Wire Formats

```typescript
// Debug public key wire format
const publicKeyBytes = Buffer.from(publicKey, 'base64');
console.log('Public key wire format length:', publicKeyBytes.length);
console.log('Public key wire format (hex):', publicKeyBytes.toString('hex'));

// Debug signature format  
const signatureBytes = Buffer.from(signature, 'base64');
console.log('Signature length:', signatureBytes.length);
console.log('Signature (hex):', signatureBytes.toString('hex'));
```

### RSA Keys (ssh-rsa)

**Expected signature format**: Raw PKCS#1 v1.5 signature bytes

```typescript
const signCallback = async (data: string): Promise<string> => {
  const message = Buffer.from(data, 'base64');
  
  // Sign message with RSA-SHA1 for ssh-rsa algorithm
  const signature = crypto.sign('RSA-SHA1', message, privateKeyPem);
  
  return signature.toString('base64');
};
```

**Key points for RSA**:
- Use RSA-SHA1 for "ssh-rsa" algorithm
- Use RSA-SHA256 for "rsa-sha2-256" algorithm  
- Return raw PKCS#1 v1.5 signature bytes
- Signature length matches key size (256 bytes for RSA-2048, 512 bytes for RSA-4096)

### ECDSA P-256 Keys (ecdsa-sha2-nistp256)

**Expected signature format**: SSH wire format with r and s components

```typescript
const signCallback = async (data: string): Promise<string> => {
  const message = Buffer.from(data, 'base64');
  
  // Sign message with ECDSA-SHA256
  const asn1Signature = crypto.sign('sha256', message, privateKeyPem);
  
  // Convert ASN.1 DER to SSH wire format
  const sshSignature = convertASN1ToSSHWireFormat(asn1Signature);
  
  return sshSignature.toString('base64');
};
```

**Key points for ECDSA**:
- Use ECDSA-SHA256 message signing
- Convert from ASN.1 DER format to SSH wire format
- Each component is 33 bytes: 1 zero byte + 32 data bytes
- Length prefix is 0x00000021 (33 in big-endian)

### Ed25519 Keys (ssh-ed25519)

**Expected signature format**: Raw 64-byte signature

```typescript
const signCallback = async (data: string): Promise<string> => {
  const message = Buffer.from(data, 'base64');
  
  // Sign message with Ed25519
  const signature = crypto.sign(null, message, {
    key: privateKeyPem,
    algorithm: 'Ed25519'
  });
  
  return signature.toString('base64');
};
```

**Key points for Ed25519**:
- Ed25519 message signing (handles hashing internally)
- Return raw 64-byte signature
- Most straightforward signature format

## Example Implementations

### Mock Implementation (Testing)

```typescript
const mockSignCallback = async (data: string): Promise<string> => {
  // For testing purposes - returns empty signature
  // In production, implement actual signing logic
  console.log('Sign callback called with data length:', Buffer.from(data, 'base64').length);
  return '';
};

// Extract public key from OpenSSH format
const opensshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host";
const publicKey = opensshKey.split(' ')[1];

await client.authenticateWithSignCallback(publicKey, mockSignCallback);
```

### React Native Keychain Integration

```typescript
import * as Keychain from 'react-native-keychain';

const keychainSignCallback = async (data: string): Promise<string> => {
  try {
    // Retrieve private key from keychain
    const credentials = await Keychain.getInternetCredentials('ssh-key');
    const privateKey = credentials.password;
    
    // Implement signing logic
    const signature = await signData(data, privateKey);
    
    return signature;
  } catch (error) {
    console.error('Keychain signing failed:', error);
    throw error;
  }
};
```

### Hardware Security Module (HSM)

```typescript
const hsmSignCallback = async (data: string): Promise<string> => {
  try {
    // Connect to HSM
    const hsm = await connectToHSM();
    
    // Sign data using HSM
    const signature = await hsm.sign({
      data: Buffer.from(data, 'base64'),
      keyId: 'ssh-key-id',
      algorithm: 'RSA-SHA256'
    });
    
    return signature.toString('base64');
  } catch (error) {
    console.error('HSM signing failed:', error);
    throw error;
  }
};
```

## Error Handling

### Callback Errors

If the sign callback throws an error or returns an invalid signature, authentication will fail:

```typescript
const signCallback = async (data: string): Promise<string> => {
  try {
    return await performSigning(data);
  } catch (error) {
    console.error('Signing failed:', error);
    // Return empty string to indicate failure
    return '';
  }
};

try {
  await client.authenticateWithSignCallback(publicKey, signCallback);
} catch (error) {
  console.error('Authentication failed:', error);
}
```

### Network Timeouts

The native layer handles timeouts automatically. If signing takes too long, the authentication will fail:

```typescript
const signCallback = async (data: string): Promise<string> => {
  // Implement timeout for signing operation
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error('Signing timeout')), 30000);
  });
  
  const signingPromise = performSigning(data);
  
  return Promise.race([signingPromise, timeoutPromise]);
};
```

## Security Considerations

### Private Key Protection

- Never expose private keys to the JavaScript layer
- Use secure storage (Keychain, HSM, Secure Enclave)
- Implement proper access controls

### Signature Validation

- Ensure signatures match the expected format
- Validate public key corresponds to private key
- Use appropriate hashing algorithms

### Error Information

- Avoid exposing sensitive information in error messages
- Log security events appropriately
- Implement rate limiting for failed attempts

## Testing

### Test Server Setup

The library includes a test server for development:

```bash
cd example/tests
./start-test-server.sh
```

### Test Implementation

```typescript
// Test callback authentication
const testSignCallback = async (data: string): Promise<string> => {
  console.log('Test sign callback called');
  // Return empty signature for testing
  return '';
};

const client = await SSHClient.connect("127.0.0.1", 2222, "user");
await client.authenticateWithSignCallback(
  "ssh-rsa AAAAB3NzaC1yc2E...", 
  testSignCallback
);
```

## Platform Support

### iOS
- Uses NMSSH library with callback authentication
- Supports all key types (RSA, ECDSA, Ed25519)
- Handles signature format conversion automatically

### Android  
- Uses JSch library with custom callback implementation
- Supports RSA and ECDSA keys
- Ed25519 support may be limited

## Troubleshooting

### Common Issues

1. **Invalid signature format**: Ensure signature matches expected format for key type
2. **Public key mismatch**: Verify public key corresponds to signing private key  
3. **Timeout errors**: Implement reasonable timeouts in callback function
4. **Platform differences**: Test on both iOS and Android

### Debug Logging

Enable debug logging to troubleshoot authentication issues:

```typescript
const debugSignCallback = async (data: string): Promise<string> => {
  console.log('Sign callback data length:', Buffer.from(data, 'base64').length);
  console.log('Sign callback data (hex):', Buffer.from(data, 'base64').toString('hex'));
  
  const signature = await performSigning(data);
  
  console.log('Generated signature length:', Buffer.from(signature, 'base64').length);
  
  return signature;
};
```

This callback authentication system provides a secure and flexible way to implement SSH authentication without exposing private keys to the React Native JavaScript environment.
