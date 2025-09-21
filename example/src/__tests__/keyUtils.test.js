import { extractP256PrivateKey, extractEd25519PrivateKey, convertECDSASignatureToSSHFormat } from '../keyUtils';

describe('Key Extraction Utilities', () => {
  const p256PrivateKeyPem = `-----BEGIN EC PRIVATE KEY-----
MIIBaAIBAQQgJfd8lr/2mBmJ8+tQUfiFAi1GkX2FjDczJTCQy2pKIW2ggfowgfcC
AQEwLAYHKoZIzj0BAQIhAP////8AAAABAAAAAAAAAAAAAAAA////////////////
MFsEIP////8AAAABAAAAAAAAAAAAAAAA///////////////8BCBaxjXYqjqT57Pr
vVV2mIa8ZR0GsMxTsPY7zjw+J9JgSwMVAMSdNgiG5wSTamZ44ROdJreBn36QBEEE
axfR8uEsQkf4vOblY6RA8ncDfYEt6zOg9KE5RdiYwpZP40Li/hp/m47n60p8D54W
K84zV2sxXs7LtkBoN79R9QIhAP////8AAAAA//////////+85vqtpxeehPO5ysL8
YyVRAgEBoUQDQgAEuF2vHuBJBPBgEBhnOmdpBXqo/hZmuFvrFIZGSoHzWFeCqJET
9YF6ZMCUwOsyWjCuu314g0kBU61+6OpDPCSs2w==
-----END EC PRIVATE KEY-----`;

  const ed25519PrivateKeyOpenSSH = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAVlUqQqJxN6oJ/bL6BSFu9cP6OTPG5aSGRVrUmzho5GwAAAJj2Xqtg9l6r
YAAAAAtzc2gtZWQyNTUxOQAAACAVlUqQqJxN6oJ/bL6BSFu9cP6OTPG5aSGRVrUmzho5Gw
AAAEBGkrNpCuJt+TTQgwXlYGp9rjCS+WmPK+H0fwXDZBtuRhWVSpConE3qgn9svoFIW71w
/o5M8blpIZFWtSbOGjkbAAAAEHRlc3QtZWQyNTUxOS1rZXkBAgMEBQ==
-----END OPENSSH PRIVATE KEY-----`;

  describe('extractP256PrivateKey', () => {
    it('should extract exactly 32 bytes from P-256 private key', () => {
      const privateKeyBytes = extractP256PrivateKey(p256PrivateKeyPem);
      
      expect(privateKeyBytes).toBeInstanceOf(Buffer);
      expect(privateKeyBytes.length).toBe(32);
      
      // Verify the extracted bytes match expected values
      const expectedBytes = Buffer.from([
        0x25, 0xf7, 0x7c, 0x96, 0xbf, 0xf6, 0x98, 0x19,
        0x89, 0xf3, 0xeb, 0x50, 0x51, 0xf8, 0x85, 0x02,
        0x2d, 0x46, 0x91, 0x7d, 0x85, 0x8c, 0x37, 0x33,
        0x25, 0x30, 0x90, 0xcb, 0x6a, 0x4a, 0x21, 0x6d
      ]);
      
      expect(privateKeyBytes).toEqual(expectedBytes);
    });

    it('should throw error for invalid PEM format', () => {
      expect(() => {
        extractP256PrivateKey('invalid-pem-data');
      }).toThrow('Failed to extract P-256 private key');
    });
  });

  describe('extractEd25519PrivateKey', () => {
    it('should extract exactly 32 bytes from Ed25519 private key', () => {
      const privateKeyBytes = extractEd25519PrivateKey(ed25519PrivateKeyOpenSSH);
      
      expect(privateKeyBytes).toBeInstanceOf(Uint8Array);
      expect(privateKeyBytes.length).toBe(32);
      
      // Verify the extracted bytes match the expected values from OpenSSL analysis
      const expectedBytes = new Uint8Array([
        0x46, 0x92, 0xb3, 0x69, 0x0a, 0xe2, 0x6d, 0xf9,
        0x34, 0xd0, 0x83, 0x05, 0xe5, 0x60, 0x6a, 0x7d,
        0xae, 0x30, 0x92, 0xf9, 0x69, 0x8f, 0x2b, 0xe1,
        0xf4, 0x7f, 0x05, 0xc3, 0x64, 0x1b, 0x6e, 0x46
      ]);
      
      for (let i = 0; i < 32; i++) {
        expect(privateKeyBytes[i]).toBe(expectedBytes[i]);
      }
    });

    it('should derive correct public key from extracted private key', () => {
      const nacl = require('tweetnacl');
      
      const privateKeyBytes = extractEd25519PrivateKey(ed25519PrivateKeyOpenSSH);
      
      // Generate key pair from extracted private key
      const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes);
      
      // Expected public key from .pub file (hex: 15954a90a89c4dea827f6cbe81485bbd70fe8e4cf1b969219156b526ce1a391b)
      const expectedPublicKey = new Uint8Array([
        0x15, 0x95, 0x4a, 0x90, 0xa8, 0x9c, 0x4d, 0xea,
        0x82, 0x7f, 0x6c, 0xbe, 0x81, 0x48, 0x5b, 0xbd,
        0x70, 0xfe, 0x8e, 0x4c, 0xf1, 0xb9, 0x69, 0x21,
        0x91, 0x56, 0xb5, 0x26, 0xce, 0x1a, 0x39, 0x1b
      ]);
      
      expect(keyPair.publicKey.length).toBe(32);
      for (let i = 0; i < 32; i++) {
        expect(keyPair.publicKey[i]).toBe(expectedPublicKey[i]);
      }
    });

    it('should create valid signatures with extracted private key', () => {
      const nacl = require('tweetnacl');
      
      const privateKeyBytes = extractEd25519PrivateKey(ed25519PrivateKeyOpenSSH);
      const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes);
      
      // Test signing and verification
      const message = new Uint8Array([1, 2, 3, 4, 5]);
      const signature = nacl.sign.detached(message, keyPair.secretKey);
      
      expect(signature.length).toBe(64);
      
      const verified = nacl.sign.detached.verify(message, signature, keyPair.publicKey);
      expect(verified).toBe(true);
    });

    it('should throw error for invalid OpenSSH format', () => {
      expect(() => {
        extractEd25519PrivateKey('invalid-openssh-data');
      }).toThrow('Failed to extract Ed25519 private key');
    });
  });

  describe('convertECDSASignatureToSSHFormat', () => {
    it('should convert ASN.1 DER signature to SSH wire format', () => {
      // Sample ASN.1 DER signature: SEQUENCE { INTEGER r, INTEGER s }
      const asn1Signature = Buffer.from([
        0x30, 0x44, // SEQUENCE, length 68
        0x02, 0x20, // INTEGER, length 32 (r)
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x02, 0x20, // INTEGER, length 32 (s)
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10
      ]);

      const sshSignature = convertECDSASignatureToSSHFormat(asn1Signature);
      
      expect(sshSignature).toBeInstanceOf(Buffer);
      expect(sshSignature.length).toBe(74); // 4 + 1 + 32 + 4 + 1 + 32 = 74
      
      // Check structure: [length][0x00][32 bytes] for each component
      expect(sshSignature.readUInt32BE(0)).toBe(0x21); // r length (33)
      expect(sshSignature[4]).toBe(0x00); // leading zero
      expect(sshSignature.readUInt32BE(37)).toBe(0x21); // s length (33)
      expect(sshSignature[41]).toBe(0x00); // leading zero
    });

    it('should handle signatures with leading zeros', () => {
      // ASN.1 signature with leading zero in r component
      const asn1Signature = Buffer.from([
        0x30, 0x45, // SEQUENCE, length 69
        0x02, 0x21, // INTEGER, length 33 (r with leading zero)
        0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x02, 0x20, // INTEGER, length 32 (s)
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10
      ]);

      const sshSignature = convertECDSASignatureToSSHFormat(asn1Signature);
      
      expect(sshSignature).toBeInstanceOf(Buffer);
      expect(sshSignature.length).toBe(74);
      
      // Should still have proper structure after removing leading zeros
      expect(sshSignature.readUInt32BE(0)).toBe(0x21); // r length (33)
      expect(sshSignature[4]).toBe(0x00); // leading zero
    });

    it('should throw error for invalid ASN.1 format', () => {
      expect(() => {
        convertECDSASignatureToSSHFormat(Buffer.from([0x01, 0x02, 0x03]));
      }).toThrow('Failed to convert ECDSA signature');
    });
  });
});
