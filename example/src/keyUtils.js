import forge from 'node-forge';
import elliptic from 'elliptic';

/**
 * Extract private key bytes from ECDSA P-256 PEM format
 * @param {string} privateKeyPem - PEM formatted private key
 * @returns {Buffer} - 32-byte private key
 */
export function extractP256PrivateKey(privateKeyPem) {
  try {
    // Parse the EC private key using forge
    const asn1 = forge.asn1.fromDer(forge.pem.decode(privateKeyPem)[0].body);
    
    // EC private key structure: SEQUENCE { version, privateKey, ... }
    // privateKey is an OCTET STRING containing the 32-byte private key
    const privateKeyOctetString = asn1.value[1]; // Second element is the private key
    const privateKeyBytes = privateKeyOctetString.value;
    
    // Convert to Buffer and ensure it's exactly 32 bytes
    const keyBuffer = Buffer.from(privateKeyBytes, 'binary');
    
    if (keyBuffer.length !== 32) {
      throw new Error(`Expected 32 bytes for P-256 private key, got ${keyBuffer.length}`);
    }
    
    return keyBuffer;
  } catch (error) {
    throw new Error(`Failed to extract P-256 private key: ${error.message}`);
  }
}

/**
 * Extract private key bytes from Ed25519 OpenSSH format
 * @param {string} opensshPrivateKey - OpenSSH formatted private key
 * @returns {Buffer} - 32-byte private key
 */
export function extractEd25519PrivateKey(opensshPrivateKey) {
  try {
    // Remove PEM headers and decode base64
    const keyData = opensshPrivateKey
      .replace(/-----[^-]+-----/g, '')
      .replace(/\s/g, '');
    
    const decoded = Buffer.from(keyData, 'base64');
    
    // Parse OpenSSH private key format
    // Skip magic bytes "openssh-key-v1\0"
    let offset = 15;
    
    // Skip ciphername length + ciphername ("none")
    const cipherNameLen = decoded.readUInt32BE(offset);
    offset += 4 + cipherNameLen;
    
    // Skip kdfname length + kdfname ("none")
    const kdfNameLen = decoded.readUInt32BE(offset);
    offset += 4 + kdfNameLen;
    
    // Skip kdf length + kdf (empty)
    const kdfLen = decoded.readUInt32BE(offset);
    offset += 4 + kdfLen;
    
    // Skip number of keys (should be 1)
    offset += 4;
    
    // Skip public key length + public key
    const pubKeyLen = decoded.readUInt32BE(offset);
    offset += 4 + pubKeyLen;
    
    // Get private key section length
    const privKeyLen = decoded.readUInt32BE(offset);
    offset += 4;
    
    // Skip checkint1 and checkint2 (8 bytes total)
    offset += 8;
    
    // Skip key type length + key type ("ssh-ed25519")
    const keyTypeLen = decoded.readUInt32BE(offset);
    offset += 4 + keyTypeLen;
    
    // Skip public key length + public key (32 bytes)
    const pubKeyLen2 = decoded.readUInt32BE(offset);
    offset += 4 + pubKeyLen2;
    
    // Get private key length (should be 64 bytes: 32 private + 32 public)
    const privKeyDataLen = decoded.readUInt32BE(offset);
    offset += 4;
    
    if (privKeyDataLen !== 64) {
      throw new Error(`Expected 64 bytes for Ed25519 private key data, got ${privKeyDataLen}`);
    }
    
    // Extract the first 32 bytes (the actual private key)
    const privateKeyBytes = decoded.slice(offset, offset + 32);
    
    if (privateKeyBytes.length !== 32) {
      throw new Error(`Expected 32 bytes for Ed25519 private key, got ${privateKeyBytes.length}`);
    }
    
    return privateKeyBytes;
  } catch (error) {
    throw new Error(`Failed to extract Ed25519 private key: ${error.message}`);
  }
}

/**
 * Convert ECDSA ASN.1 DER signature to SSH wire format
 * @param {Buffer} asn1Signature - ASN.1 DER encoded signature
 * @returns {Buffer} - SSH wire format signature
 */
export function convertECDSASignatureToSSHFormat(asn1Signature) {
  try {
    // Parse ASN.1: SEQUENCE { INTEGER r, INTEGER s }
    let offset = 2; // Skip SEQUENCE tag and length
    
    // Parse r
    if (asn1Signature[offset] !== 0x02) {
      throw new Error('Expected INTEGER tag for r component');
    }
    offset++; // Skip INTEGER tag
    const rLength = asn1Signature[offset++];
    let r = asn1Signature.slice(offset, offset + rLength);
    offset += rLength;
    
    // Parse s
    if (asn1Signature[offset] !== 0x02) {
      throw new Error('Expected INTEGER tag for s component');
    }
    offset++; // Skip INTEGER tag
    const sLength = asn1Signature[offset++];
    let s = asn1Signature.slice(offset, offset + sLength);
    
    // Remove leading zeros, but keep at least one byte
    while (r.length > 1 && r[0] === 0x00) {
      r = r.slice(1);
    }
    while (s.length > 1 && s[0] === 0x00) {
      s = s.slice(1);
    }
    
    // Pad to 32 bytes for P-256
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
  } catch (error) {
    throw new Error(`Failed to convert ECDSA signature: ${error.message}`);
  }
}
