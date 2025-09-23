import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import SSHClient from 'react-native-ssh-sftp';
import forge from 'node-forge';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import elliptic from 'elliptic';

const NATIVE_EVENT_SHELL = 'Shell';
const NATIVE_EVENT_DOWNLOAD_PROGRESS = 'DownloadProgress';
const NATIVE_EVENT_UPLOAD_PROGRESS = 'UploadProgress';
const NATIVE_EVENT_SIGN_CALLBACK = 'SignCallback';

const RNSSHClient = NativeModules.RNSSHClient;

const emitter = new NativeEventEmitter(RNSSHClient);

emitter.addListener('SignCallback', event => {
  console.log('App.SignCallback:', event);
});

// this is because event emitter don't work right in this example because voodoo
SSHClient.setClient(RNSSHClient, emitter);

const HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const PORT = 2222;

// Key extraction utilities
function extractP256PrivateKey(privateKeyPem) {
  try {
    // Parse the EC private key using forge
    const asn1 = forge.asn1.fromDer(forge.pem.decode(privateKeyPem)[0].body);

    // EC private key structure: SEQUENCE { version, privateKey, ... }
    // privateKey is an OCTET STRING containing the 32-byte private key
    const privateKeyOctetString = asn1.value[1]; // Second element is the private key
    const privateKeyBytes = privateKeyOctetString.value;

    // Convert to Uint8Array and ensure it's exactly 32 bytes
    const keyArray = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      keyArray[i] = privateKeyBytes.charCodeAt(i);
    }

    return keyArray;
  } catch (error) {
    throw new Error(`Failed to extract P-256 private key: ${error.message}`);
  }
}

function extractEd25519PrivateKey(opensshPrivateKey) {
  try {
    // Remove PEM headers and decode base64
    const keyData = opensshPrivateKey
      .replace(/-----[^-]+-----/g, '')
      .replace(/\s/g, '');

    const decoded = forge.util.decode64(keyData);

    // Parse OpenSSH private key format
    // Skip magic bytes "openssh-key-v1\0"
    let offset = 15;

    // Skip ciphername length + ciphername ("none")
    const cipherNameLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + cipherNameLen;

    // Skip kdfname length + kdfname ("none")
    const kdfNameLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + kdfNameLen;

    // Skip kdf length + kdf (empty)
    const kdfLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + kdfLen;

    // Skip number of keys (should be 1)
    offset += 4;

    // Skip public key length + public key
    const pubKeyLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + pubKeyLen;

    // Get private key section length
    const privKeyLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4;

    // Skip checkint1 and checkint2 (8 bytes total)
    offset += 8;

    // Skip key type length + key type ("ssh-ed25519")
    const keyTypeLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + keyTypeLen;

    // Skip public key length + public key (32 bytes)
    const pubKeyLen2 =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4 + pubKeyLen2;

    // Get private key length (should be 64 bytes: 32 private + 32 public)
    const privKeyDataLen =
      (decoded.charCodeAt(offset) << 24) |
      (decoded.charCodeAt(offset + 1) << 16) |
      (decoded.charCodeAt(offset + 2) << 8) |
      decoded.charCodeAt(offset + 3);
    offset += 4;

    if (privKeyDataLen !== 64) {
      throw new Error(
        `Expected 64 bytes for Ed25519 private key data, got ${privKeyDataLen}`,
      );
    }

    // Extract the first 32 bytes (the actual private key)
    const privateKeyArray = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      privateKeyArray[i] = decoded.charCodeAt(offset + i);
    }

    return privateKeyArray;
  } catch (error) {
    throw new Error(`Failed to extract Ed25519 private key: ${error.message}`);
  }
}


export default function App() {
  const [status, setStatus] = useState('Ready');

  const testConnection = async () => {
    setStatus('Testing...');
    try {
      const client = await SSHClient.connect(HOST, PORT, 'test');
      await client.authenticateWithPassword('test');
      setStatus('Connected');
      client.disconnect();
    } catch (error) {
      setStatus('Native call successful (connection failed as expected)');
      Alert.alert('Success', 'Native SSH module is working correctly!');
    }
  };

  const testDockerConnection = async () => {
    setStatus('Testing Docker SSH...');
    try {
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithPassword('password');
      setStatus('Docker SSH Connected!');
      client.disconnect();
      Alert.alert('Success', 'Connected to Docker SSH server!');
    } catch (error) {
      const errorMsg = `Failed to connect to Docker SSH: ${error.message}`;
      const errnoMsg =
        error.errno !== undefined ? ` (errno: ${error.errno})` : '';
      setStatus(`Docker SSH Failed: ${error.message}${errnoMsg}`);
      Alert.alert('Error', errorMsg + errnoMsg);
    }
  };

  const testRSAKey = async () => {
    setStatus('Testing RSA Key...');
    try {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAv17pUAUNprNrAPtECHuVz1nZhg6m+aAcwYzgxVEDyHRfXrUU
ZRH0EA0uvmBmopT/xflhjFjdzr1hwU1cBF5MUsz3NKnxubKnankH/9Uk75DfiPfE
lmCGihJL9CFXuXkwDK/GrQPIM198PVx6KrYOGnnmbc+bgYHd6tmHRvUYkZEzCeGB
0+U80EhScvhQrleEj+EmlP2b+UP4K2U7DHAWpdbc4rt8Z7mB+byZrxV1wz8FIien
WvqFGH+w/sLKpS/Pyg8okT4NlV/hPayKDXtieejFo1KKqGv+OWO02jQ/MzfX8U8O
m4FPVvWK3uSaS2kfSrb6BE3upSKa3OSFeeD1sQIDAQABAoIBAAiXPCYJdAltuHn8
zZsL4TfDss4fzkMaeu/9YQG6l07iWn2n51h6K9ikntqQ/UqDIdBDV6uzOZHUUpUY
4e6YRRjadqZ4ko9hg7513HQRn2zZtg8yADM39hIwrBQzgvqihBOtuF9/8fbMbIlc
o2dTcOKjYkK/tR1lNQ8b4MTAr++o3xGcKXtnVkQdQSDYvV5CL1lwzer2Vq5hmxXF
f/VMcbLgZc3yGqywcKKaP6AUTolcQQryVJ0T5epUbLBFGLinHXCjy1KWMrfAnySE
buPF0yJmSzbx/AKu+5+KpkjjhReprcswVW/ogGOUoz9y30GCTtkcQvG12T2EvxwY
8et1JzkCgYEA7tVspyFilW8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GI
GR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpX
cnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8CgYEAzSAp
Z1o0iuL1pjo202TczOBDf1c/Anno5hJw3NslWJIekrQqRE+UqovKTd4RRjG07Zb6
38fS1TmWltkFwYBDtSgqJ5cWWxZygffcSaXsKjDHaxy1bDtiIyQbHo5SQYs6Nkkt
lstPBezzZuKbNf3I7AS7x2bu59qrk+guBbfRl/8CgYBr0am1YZrxvyaiT8PqE9R+
4cfPoTI8mdMeGSFOrcOJhTUVMn5tihS40rPxeLPT98h+KYX4qASXD9ztAKmMZPBF
tNWPwJEsMkMfGGtJS1lpZXs9nnsTxPYpUj+3gsudgJ050ODLcqNCi67ykhFRBfId
nhd5ByzxPkIZnfdNv546fQKBgQCU0+b2g+5nbrCIwOgSjLXfOEAA3o5q/4TJmUum
EqKQFsRz8KBSG+NjsjVANgUWhu4dDFRNlTAVYMkv/Zo9gRCfGdssCmVABZNjVTDR
hr9JBUdLIfNH6fYURRggHWb1A01jIckgBbb6N6eKWJQAonfrNqv/y2E/e9rNX8I0
h+BchQKBgFkO4+5fL/7sB2EG9VBw1AaQwM2esO07Zv0emOYojXqVKShAL2xD7dw1
HYI/V6f7UiJ+EL+LJUjkPYx0GLU1hO24xZlK3TjVzYLuEGxtRVLvT9hOx26s28cE
gQT51sWj0C7S5tkmVWqRbuKLPLNTa4IW+Ls30yReijz95DWMHf0X
-----END RSA PRIVATE KEY-----`;
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithKey(privateKey);
      setStatus('RSA Key Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`RSA Key Failed: ${error.message}`);
    }
  };

  const testOpenSSHKey = async () => {
    setStatus('Testing OpenSSH Key...');
    try {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAv17pUAUNprNrAPtECHuVz1nZhg6m+aAcwYzgxVEDyHRfXrUU
ZRH0EA0uvmBmopT/xflhjFjdzr1hwU1cBF5MUsz3NKnxubKnankH/9Uk75DfiPfE
lmCGihJL9CFXuXkwDK/GrQPIM198PVx6KrYOGnnmbc+bgYHd6tmHRvUYkZEzCeGB
0+U80EhScvhQrleEj+EmlP2b+UP4K2U7DHAWpdbc4rt8Z7mB+byZrxV1wz8FIien
WvqFGH+w/sLKpS/Pyg8okT4NlV/hPayKDXtieejFo1KKqGv+OWO02jQ/MzfX8U8O
m4FPVvWK3uSaS2kfSrb6BE3upSKa3OSFeeD1sQIDAQABAoIBAAiXPCYJdAltuHn8
zZsL4TfDss4fzkMaeu/9YQG6l07iWn2n51h6K9ikntqQ/UqDIdBDV6uzOZHUUpUY
4e6YRRjadqZ4ko9hg7513HQRn2zZtg8yADM39hIwrBQzgvqihBOtuF9/8fbMbIlc
o2dTcOKjYkK/tR1lNQ8b4MTAr++o3xGcKXtnVkQdQSDYvV5CL1lwzer2Vq5hmxXF
f/VMcbLgZc3yGqywcKKaP6AUTolcQQryVJ0T5epUbLBFGLinHXCjy1KWMrfAnySE
buPF0yJmSzbx/AKu+5+KpkjjhReprcswVW/ogGOUoz9y30GCTtkcQvG12T2EvxwY
8et1JzkCgYEA7tVspyFilW8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GI
GR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpX
cnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8CgYEAzSAp
Z1o0iuL1pjo202TczOBDf1c/Anno5hJw3NslWJIekrQqRE+UqovKTd4RRjG07Zb6
38fS1TmWltkFwYBDtSgqJ5cWWxZygffcSaXsKjDHaxy1bDtiIyQbHo5SQYs6Nkkt
lstPBezzZuKbNf3I7AS7x2bu59qrk+guBbfRl/8CgYBr0am1YZrxvyaiT8PqE9R+
4cfPoTI8mdMeGSFOrcOJhTUVMn5tihS40rPxeLPT98h+KYX4qASXD9ztAKmMZPBF
tNWPwJEsMkMfGGtJS1lpZXs9nnsTxPYpUj+3gsudgJ050ODLcqNCi67ykhFRBfId
nhd5ByzxPkIZnfdNv546fQKBgQCU0+b2g+5nbrCIwOgSjLXfOEAA3o5q/4TJmUum
EqKQFsRz8KBSG+NjsjVANgUWhu4dDFRNlTAVYMkv/Zo9gRCfGdssCmVABZNjVTDR
hr9JBUdLIfNH6fYURRggHWb1A01jIckgBbb6N6eKWJQAonfrNqv/y2E/e9rNX8I0
h+BchQKBgFkO4+5fL/7sB2EG9VBw1AaQwM2esO07Zv0emOYojXqVKShAL2xD7dw1
HYI/V6f7UiJ+EL+LJUjkPYx0GLU1hO24xZlK3TjVzYLuEGxtRVLvT9hOx26s28cE
gQT51sWj0C7S5tkmVWqRbuKLPLNTa4IW+Ls30yReijz95DWMHf0X
-----END RSA PRIVATE KEY-----`;
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithKey(privateKey);
      setStatus('OpenSSH Key Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`OpenSSH Key Failed: ${error.message}`);
    }
  };

  const testSFTP = async () => {
    setStatus('Testing SFTP...');
    try {
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithPassword('password');
      await client.connectSFTP();
      const files = await client.sftpLs('.');
      setStatus(`SFTP Connected! Found ${files.length} files`);
      client.disconnect();
    } catch (error) {
      setStatus(`SFTP Failed: ${error.message}`);
    }
  };

  const testEncryptedRSAKey = async () => {
    setStatus('Testing Encrypted RSA Key...');
    try {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,C083DCA20547E5DE8E3E0FCE166AC2BF

3ido/T+ye3HJdudwmOGjAEOjjukpLw5sFM0hklqvsB9BqsDrD3I+D/ZE58Lk6JY3
skLtdld1MBiTFUKVObpotO78EMerLu/rQqGZC9LiNK+FgsiSN4ii+5A8IM2h5jLl
rKZYeMxM28GFDBduqKKWkdVrfvhV/KZ5LUGXs6AV3xOFsHxQL7Q23E8Y2IAIzOOX
jg/2yzofTmuXfTQyd0iLN3m+naRhXnmO2xvor16j++Xn+x1r2YcEcaHlSt9/WZJW
uFS4aXDV1/8OKkbwZbFmTdYpHdKaG4GmzLi8mBOYTyTIU0OI7DaRno9Jej7Laoz1
rtRKyocmCLqTse7LL1OgSOudVN+iyHHrnxP/RErslFNu7GBvgpI5/3IrlOtCokbi
rxQJOUYg1l0jbsokMZOnfJX9ReaMxo/2RpSohYvl36irKsPW9eyXwWQLURnspPJX
3BquV83m45xhcwAJk38x66bg2/adcz2cfhtJIgLyLnj0HaD0uUuf0lXV380fiH1T
ULLvBgSNBeeRy0PrbmSGaAztzrDRSvc3v3YOCXfiWKY71wvtJo0NR43lChjr/Mx2
m/vUHao69b2nKCUGeLqIaxEbAn5VtrpthKw3bX8CWE88pPMPWPueBXF8AnyoN3Xi
Bx+9w5xJKlM7JB+FCnerjTSHl/YS3ebAPztKRb5+caajKQZKCJ/aLPvpNsZ1QAy/
WaChVSy3JQWgTZTLZJQrVFN4rDIWwKlwOtowh43AIAjCAvljlZDCYrZfIU/bC9Kj
Jtt97LRIyifnNKHgcL2cTHfp2MS24W7sWtKls1MPrVXlhQRo0jGXdFwGoIH8f/Q5
m8XySlCC066Yv7VocqcxW9iDWNmnffZkqurQJWY2RAt0VYLjp34Jp46r8VGrJwkx
4IdD7JCUGGlLDkPOB88GPJ4R0k4rcj143Sp+UZFk8Wf8hhNpSOBDvwnZiaHrkRKK
LnmE3lvufXf/IiHHGslIWzQ/GTgJvGVCQo0aSLPw/e8kfksthD6OuTeBKMN6LHP3
lMJ8NpfV68ssrLIliPxGdLsx9X5Tf0LXTHpYJdqa3RhRO2UO2e0zA8xxBxLzQATi
1plKc2xIbkiBUuwgxwr/AG8hkSDQHSTbpU6tauglzZeYKRBwpY/wm9+/ymnmlJy1
fPuzcZV1/HlYjc3SJuVxVeWp39Ek0CZtf33gDKYRz2Qj/pqZsSV2aSR/Ibb2UHyv
0M9nOT2Q988IKS0Ol/I0yuqKdz9oJCqrHROSFrgVYUJuGYA/HShKJIrOkWf6lFTu
i7Krl6AXcz285sVzvEAlu27FiJFUIDzRU/7GdCDJN6V8YB4AkAF4o8qL53aZuCxd
5cDai7UrXx6N+AnwayWH3EQdoukmS5XScHANqni4VjnXuWAVZc6JL3j4UyzMAsA2
WhwVl1ZKPijqaeYm+UlGIYVjdkKmJb7XAFzeP2jgfUZ8HYA+VlUsPEMcqR5AL6mu
D6/OHAfwShJpHro4mwSo/Gptr31nANMR5y++l9u2SS4PIwVGvlPQbtw+V2mga1Cz
gabzR7vGspCHltGME7l7mIe6l13ixn8dd8ils2j97NjMbafncDkQM/uwsZaXU/JU
-----END RSA PRIVATE KEY-----`;
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithKey(privateKey, 'password');
      setStatus('Encrypted RSA Key Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`Encrypted RSA Key Failed: ${error.message}`);
    }
  };

  const testSignCallback = async () => {
    setStatus('Testing RSA 2048 Sign Callback...');
    try {
      // Use the correct public key from id_rsa_nopass.pub
      const publicKeySSH = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/XulQBQ2ms2sA+0QIe5XPWdmGDqb5oBzBjODFUQPIdF9etRRlEfQQDS6+YGailP/F+WGMWN3OvWHBTVwEXkxSzPc0qfG5sqdqeQf/1STvkN+I98SWYIaKEkv0IVe5eTAMr8atA8gzX3w9XHoqtg4aeeZtz5uBgd3q2YdG9RiRkTMJ4YHT5TzQSFJy+FCuV4SP4SaU/Zv5Q/grZTsMcBal1tziu3xnuYH5vJmvFXXDPwUiJ6da+oUYf7D+wsqlL8/KDyiRPg2VX+E9rIoNe2J56MWjUoqoa/45Y7TaND8zN9fxTw6bgU9W9Yre5JpLaR9KtvoETe6lIprc5IV54PWx test-agent@nmssh`;
      const publicKey = publicKeySSH.split(' ')[1];

      const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAv17pUAUNprNrAPtECHuVz1nZhg6m+aAcwYzgxVEDyHRfXrUU
ZRH0EA0uvmBmopT/xflhjFjdzr1hwU1cBF5MUsz3NKnxubKnankH/9Uk75DfiPfE
lmCGihJL9CFXuXkwDK/GrQPIM198PVx6KrYOGnnmbc+bgYHd6tmHRvUYkZEzCeGB
0+U80EhScvhQrleEj+EmlP2b+UP4K2U7DHAWpdbc4rt8Z7mB+byZrxV1wz8FIien
WvqFGH+w/sLKpS/Pyg8okT4NlV/hPayKDXtieejFo1KKqGv+OWO02jQ/MzfX8U8O
m4FPVvWK3uSaS2kfSrb6BE3upSKa3OSFeeD1sQIDAQABAoIBAAiXPCYJdAltuHn8
zZsL4TfDss4fzkMaeu/9YQG6l07iWn2n51h6K9ikntqQ/UqDIdBDV6uzOZHUUpUY
4e6YRRjadqZ4ko9hg7513HQRn2zZtg8yADM39hIwrBQzgvqihBOtuF9/8fbMbIlc
o2dTcOKjYkK/tR1lNQ8b4MTAr++o3xGcKXtnVkQdQSDYvV5CL1lwzer2Vq5hmxXF
f/VMcbLgZc3yGqywcKKaP6AUTolcQQryVJ0T5epUbLBFGLinHXCjy1KWMrfAnySE
buPF0yJmSzbx/AKu+5+KpkjjhReprcswVW/ogGOUoz9y30GCTtkcQvG12T2EvxwY
8et1JzkCgYEA7tVspyFilW8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GI
GR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpX
cnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8CgYEAzSAp
Z1o0iuL1pjo202TczOBDf1c/Anno5hJw3NslWJIekrQqRE+UqovKTd4RRjG07Zb6
38fS1TmWltkFwYBDtSgqJ5cWWxZygffcSaXsKjDHaxy1bDtiIyQbHo5SQYs6Nkkt
lstPBezzZuKbNf3I7AS7x2bu59qrk+guBbfRl/8CgYBr0am1YZrxvyaiT8PqE9R+
4cfPoTI8mdMeGSFOrcOJhTUVMn5tihS40rPxeLPT98h+KYX4qASXD9ztAKmMZPBF
tNWPwJEsMkMfGGtJS1lpZXs9nnsTxPYpUj+3gsudgJ050ODLcqNCi67ykhFRBfId
nhd5ByzxPkIZnfdNv546fQKBgQCU0+b2g+5nbrCIwOgSjLXfOEAA3o5q/4TJmUum
EqKQFsRz8KBSG+NjsjVANgUWhu4dDFRNlTAVYMkv/Zo9gRCfGdssCmVABZNjVTDR
hr9JBUdLIfNH6fYURRggHWb1A01jIckgBbb6N6eKWJQAonfrNqv/y2E/e9rNX8I0
h+BchQKBgFkO4+5fL/7sB2EG9VBw1AaQwM2esO07Zv0emOYojXqVKShAL2xD7dw1
HYI/V6f7UiJ+EL+LJUjkPYx0GLU1hO24xZlK3TjVzYLuEGxtRVLvT9hOx26s28cE
gQT51sWj0C7S5tkmVWqRbuKLPLNTa4IW+Ls30yReijz95DWMHf0X
-----END RSA PRIVATE KEY-----`;

      const testPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      const signCallback = async data => {
        const rawData = forge.util.decode64(data);
        const md = forge.md.sha1.create();
        md.update(rawData);
        const signature = testPrivateKey.sign(md);
        return forge.util.encode64(signature);
      };

      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithSignCallback(publicKey, signCallback);
      setStatus('RSA 2048 Sign Callback Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`RSA 2048 Sign Callback Failed: ${error.message}`);
    }
  };

  const testRSA2048SHA256SignCallback = async () => {
    setStatus('Testing RSA 2048 SHA256 Sign Callback...');
    try {
      const publicKeySSH = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/XulQBQ2ms2sA+0QIe5XPWdmGDqb5oBzBjODFUQPIdF9etRRlEfQQDS6+YGailP/F+WGMWN3OvWHBTVwEXkxSzPc0qfG5sqdqeQf/1STvkN+I98SWYIaKEkv0IVe5eTAMr8atA8gzX3w9XHoqtg4aeeZtz5uBgd3q2YdG9RiRkTMJ4YHT5TzQSFJy+FCuV4SP4SaU/Zv5Q/grZTsMcBal1tziu3xnuYH5vJmvFXXDPwUiJ6da+oUYf7D+wsqlL8/KDyiRPg2VX+E9rIoNe2J56MWjUoqoa/45Y7TaND8zN9fxTw6bgU9W9Yre5JpLaR9KtvoETe6lIprc5IV54PWx test-agent@nmssh`;
      const originalPublicKey = publicKeySSH.split(' ')[1];

      // Decode the SSH wire format public key
      const keyBytes = forge.util.decode64(originalPublicKey);
      let offset = 0;

      // Read algorithm name length (4 bytes)
      const algLen =
        (keyBytes.charCodeAt(offset) << 24) |
        (keyBytes.charCodeAt(offset + 1) << 16) |
        (keyBytes.charCodeAt(offset + 2) << 8) |
        keyBytes.charCodeAt(offset + 3);
      offset += 4;

      // Skip algorithm name ("ssh-rsa")
      offset += algLen;

      // Read e length and value
      const eLen =
        (keyBytes.charCodeAt(offset) << 24) |
        (keyBytes.charCodeAt(offset + 1) << 16) |
        (keyBytes.charCodeAt(offset + 2) << 8) |
        keyBytes.charCodeAt(offset + 3);
      offset += 4;
      const e = keyBytes.substring(offset, offset + eLen);
      offset += eLen;

      // Read n length and value
      const nLen =
        (keyBytes.charCodeAt(offset) << 24) |
        (keyBytes.charCodeAt(offset + 1) << 16) |
        (keyBytes.charCodeAt(offset + 2) << 8) |
        keyBytes.charCodeAt(offset + 3);
      offset += 4;
      const n = keyBytes.substring(offset, offset + nLen);

      // Reassemble with rsa-sha2-256
      const newAlg = 'rsa-sha2-256';
      const newAlgLen = newAlg.length;

      let newKey = '';
      // Algorithm length (4 bytes)
      newKey += String.fromCharCode((newAlgLen >>> 24) & 0xff);
      newKey += String.fromCharCode((newAlgLen >>> 16) & 0xff);
      newKey += String.fromCharCode((newAlgLen >>> 8) & 0xff);
      newKey += String.fromCharCode(newAlgLen & 0xff);
      // Algorithm name
      newKey += newAlg;
      // e length (4 bytes)
      newKey += String.fromCharCode((eLen >>> 24) & 0xff);
      newKey += String.fromCharCode((eLen >>> 16) & 0xff);
      newKey += String.fromCharCode((eLen >>> 8) & 0xff);
      newKey += String.fromCharCode(eLen & 0xff);
      // e value
      newKey += e;
      // n length (4 bytes)
      newKey += String.fromCharCode((nLen >>> 24) & 0xff);
      newKey += String.fromCharCode((nLen >>> 16) & 0xff);
      newKey += String.fromCharCode((nLen >>> 8) & 0xff);
      newKey += String.fromCharCode(nLen & 0xff);
      // n value
      newKey += n;

      const publicKey = forge.util.encode64(newKey);

      const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAv17pUAUNprNrAPtECHuVz1nZhg6m+aAcwYzgxVEDyHRfXrUU
ZRH0EA0uvmBmopT/xflhjFjdzr1hwU1cBF5MUsz3NKnxubKnankH/9Uk75DfiPfE
lmCGihJL9CFXuXkwDK/GrQPIM198PVx6KrYOGnnmbc+bgYHd6tmHRvUYkZEzCeGB
0+U80EhScvhQrleEj+EmlP2b+UP4K2U7DHAWpdbc4rt8Z7mB+byZrxV1wz8FIien
WvqFGH+w/sLKpS/Pyg8okT4NlV/hPayKDXtieejFo1KKqGv+OWO02jQ/MzfX8U8O
m4FPVvWK3uSaS2kfSrb6BE3upSKa3OSFeeD1sQIDAQABAoIBAAiXPCYJdAltuHn8
zZsL4TfDss4fzkMaeu/9YQG6l07iWn2n51h6K9ikntqQ/UqDIdBDV6uzOZHUUpUY
4e6YRRjadqZ4ko9hg7513HQRn2zZtg8yADM39hIwrBQzgvqihBOtuF9/8fbMbIlc
o2dTcOKjYkK/tR1lNQ8b4MTAr++o3xGcKXtnVkQdQSDYvV5CL1lwzer2Vq5hmxXF
f/VMcbLgZc3yGqywcKKaP6AUTolcQQryVJ0T5epUbLBFGLinHXCjy1KWMrfAnySE
buPF0yJmSzbx/AKu+5+KpkjjhReprcswVW/ogGOUoz9y30GCTtkcQvG12T2EvxwY
8et1JzkCgYEA7tVspyFilW8EmT5WF+n5ntUE6N8MmL0co9DazxHB3fvehHPW86GI
GR9hqAZGnLcPtoD2LArYEXuCVcebL/maTR9wDt3UZZQK4SzKNkr0xnMfH/GJ5GpX
cnHYLZHcP9v1f9G2jvA5ON+8+mJuv0nVxVYR0SjgEzPBSKqSIAF88k8CgYEAzSAp
Z1o0iuL1pjo202TczOBDf1c/Anno5hJw3NslWJIekrQqRE+UqovKTd4RRjG07Zb6
38fS1TmWltkFwYBDtSgqJ5cWWxZygffcSaXsKjDHaxy1bDtiIyQbHo5SQYs6Nkkt
lstPBezzZuKbNf3I7AS7x2bu59qrk+guBbfRl/8CgYBr0am1YZrxvyaiT8PqE9R+
4cfPoTI8mdMeGSFOrcOJhTUVMn5tihS40rPxeLPT98h+KYX4qASXD9ztAKmMZPBF
tNWPwJEsMkMfGGtJS1lpZXs9nnsTxPYpUj+3gsudgJ050ODLcqNCi67ykhFRBfId
nhd5ByzxPkIZnfdNv546fQKBgQCU0+b2g+5nbrCIwOgSjLXfOEAA3o5q/4TJmUum
EqKQFsRz8KBSG+NjsjVANgUWhu4dDFRNlTAVYMkv/Zo9gRCfGdssCmVABZNjVTDR
hr9JBUdLIfNH6fYURRggHWb1A01jIckgBbb6N6eKWJQAonfrNqv/y2E/e9rNX8I0
h+BchQKBgFkO4+5fL/7sB2EG9VBw1AaQwM2esO07Zv0emOYojXqVKShAL2xD7dw1
HYI/V6f7UiJ+EL+LJUjkPYx0GLU1hO24xZlK3TjVzYLuEGxtRVLvT9hOx26s28cE
gQT51sWj0C7S5tkmVWqRbuKLPLNTa4IW+Ls30yReijz95DWMHf0X
-----END RSA PRIVATE KEY-----`;

      const testPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      const signCallback = async data => {
        const rawData = forge.util.decode64(data);
        const md = forge.md.sha256.create();
        md.update(rawData);
        const signature = testPrivateKey.sign(md);
        return forge.util.encode64(signature);
      };

      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithSignCallback(publicKey, signCallback);
      setStatus('RSA 2048 SHA256 Sign Callback Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`RSA 2048 SHA256 Sign Callback Failed: ${error.message}`);
    }
  };

  const testRSA4096SignCallback = async () => {
    setStatus('Testing RSA 4096 Sign Callback...');
    try {
      const publicKeySSH = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDTyI5YhfguzP/8xS9DAWxXR511JGjXzfySlryiZVq0Tk5iYKwjg14kXZEWnIAf2p7e2PASKp1TclNwBTsuqQzKbZFYOW+RQZP56FD0nqdohvaQpdAuo5CSARVztHo6b22T/zMYxxg57rKf7O4X4FoET6/YH2GgK6ydGjDZxzUEPPxK5DJfs76SXfmA9t6uFF2HMSs0BsW6IgzMKZoi6WQkiiFkWgQkkvE5lSRe7w3nnJvRdKvRBqNzJtyNj4MeUVnzSCJ77nsEvZZ6+OGx7GQ/P9MUi+MKsEIn5KmtEPtKg/QaA/XLddNQ5/y1DuGHqi9ZpY562xZEe31xzewx7fWLmxE9Jwc5cXOaPbg/ENskRVnEMKvCfGnXIeFaeHrredgBwOqdLbnadNVn/C8yGylACaRrIuDBKeLAGfTNxlguHzqHzsXmlciV5PtEaVKnRUkaq5eykyJIpQKlE/SrssnTpgnoNPEM0cFyEjUqqGrdXtMAnVA2YXeIlNLhiaRsr8Ws0Y0PKqJp0lE2idCoZndBbrSpYi+UN5trstH3ihKfXOu0vTRPK1OOMlnG1jHzmcqpkEUWwp+HgyOu7jQJqHWDyMjwKmNqYHxmiQNI+16kQzaIBAinsSvYjw5jIvbCXfbBaBP0+HCFKhnyYUuvGYxYWn6LNeevuYRHto/QOekOeQ== test-rsa4096@nmssh`;
      const publicKey = publicKeySSH.split(' ')[1];

      const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

      const testPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      const signCallback = async data => {
        const rawData = forge.util.decode64(data);
        const md = forge.md.sha1.create();
        md.update(rawData);
        const signature = testPrivateKey.sign(md);
        return forge.util.encode64(signature);
      };

      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithSignCallback(publicKey, signCallback);
      setStatus('RSA 4096 Sign Callback Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`RSA 4096 Sign Callback Failed: ${error.message}`);
    }
  };

  const testECDSASignCallback = async () => {
    setStatus('Testing ECDSA P-256 Sign Callback...');
    try {
      const publicKeySSH = `ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLhdrx7gSQTwYBAYZzpnaQV6qP4WZrhb6xSGRkqB81hXgqiRE/WBemTAlMDrMlowrrt9eINJAVOtfujqQzwkrNs= your-comment`;
      const publicKey = publicKeySSH.split(' ')[1];

      const privateKeyPem = `-----BEGIN EC PRIVATE KEY-----
MIIBaAIBAQQgJfd8lr/2mBmJ8+tQUfiFAi1GkX2FjDczJTCQy2pKIW2ggfowgfcC
AQEwLAYHKoZIzj0BAQIhAP////8AAAABAAAAAAAAAAAAAAAA////////////////
MFsEIP////8AAAABAAAAAAAAAAAAAAAA///////////////8BCBaxjXYqjqT57Pr
vVV2mIa8ZR0GsMxTsPY7zjw+J9JgSwMVAMSdNgiG5wSTamZ44ROdJreBn36QBEEE
axfR8uEsQkf4vOblY6RA8ncDfYEt6zOg9KE5RdiYwpZP40Li/hp/m47n60p8D54W
K84zV2sxXs7LtkBoN79R9QIhAP////8AAAAA//////////+85vqtpxeehPO5ysL8
YyVRAgEBoUQDQgAEuF2vHuBJBPBgEBhnOmdpBXqo/hZmuFvrFIZGSoHzWFeCqJET
9YF6ZMCUwOsyWjCuu314g0kBU61+6OpDPCSs2w==
-----END EC PRIVATE KEY-----`;

      // Extract the 32-byte private key using our utility
      const privateKeyBytes = extractP256PrivateKey(privateKeyPem);

      const EC = elliptic.ec;
      const ec = new EC('p256');
      const keyPair = ec.keyFromPrivate(privateKeyBytes);

      const signCallback = async data => {
        console.log(
          'ECDSA P-256 sign callback called with data length:',
          forge.util.decode64(data).length,
        );
        try {
          const rawData = forge.util.decode64(data);
          const hash = forge.md.sha256.create();
          hash.update(rawData);
          const hashBytes = hash.digest().getBytes();

          // Sign with ECDSA
          const signature = keyPair.sign(
            forge.util.bytesToHex(hashBytes),
            'hex',
          );

          // Convert to SSH wire format
          const r = signature.r.toArray('be', 32);
          const s = signature.s.toArray('be', 32);

          // Create SSH wire format signature manually
          const sshSignature = new Uint8Array(74); // 4 + 1 + 32 + 4 + 1 + 32 = 74
          let offset = 0;

          // r length (33 bytes)
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x21;

          // leading zero for r
          sshSignature[offset++] = 0x00;

          // r component (32 bytes)
          for (let i = 0; i < 32; i++) {
            sshSignature[offset++] = r[i];
          }

          // s length (33 bytes)
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x00;
          sshSignature[offset++] = 0x21;

          // leading zero for s
          sshSignature[offset++] = 0x00;

          // s component (32 bytes)
          for (let i = 0; i < 32; i++) {
            sshSignature[offset++] = s[i];
          }

          console.log(
            'ECDSA P-256 signature generated, length:',
            sshSignature.length,
          );
          return forge.util.encode64(
            forge.util.binary.raw.encode(sshSignature),
          );
        } catch (error) {
          console.error('ECDSA P-256 signing error:', error);
          throw error;
        }
      };

      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithSignCallback(publicKey, signCallback);
      setStatus('ECDSA P-256 Sign Callback Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`ECDSA P-256 Sign Callback Failed: ${error.message}`);
    }
  };

  const testEd25519SignCallback = async () => {
    setStatus('Testing Ed25519 Sign Callback...');
    try {
      const publicKeySSH = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBWVSpConE3qgn9svoFIW71w/o5M8blpIZFWtSbOGjkb test-ed25519-key`;
      const publicKey = publicKeySSH.split(' ')[1];

      const privateKeyOpenSSH = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAVlUqQqJxN6oJ/bL6BSFu9cP6OTPG5aSGRVrUmzho5GwAAAJjbmvDh25rw
4QAAAAtzc2gtZWQyNTUxOQAAACAVlUqQqJxN6oJ/bL6BSFu9cP6OTPG5aSGRVrUmzho5Gw
AAAEBGkrNpCuJt+TTQgwXlYGp9rjCS+WmPK+H0fwXDZBtuRhWVSpConE3qgn9svoFIW71w
/o5M8blpIZFWtSbOGjkbAAAAEHRlc3QtZWQyNTUxOS1rZXkBAgMEBQ==
-----END OPENSSH PRIVATE KEY-----`;

      // Extract the 32-byte private key seed using our utility
      const privateKeySeed = extractEd25519PrivateKey(privateKeyOpenSSH);

      // Generate the full key pair from the seed
      const keyPair = nacl.sign.keyPair.fromSeed(privateKeySeed);

      const signCallback = async data => {
        console.log(
          'Ed25519 sign callback called with data length:',
          forge.util.decode64(data).length,
        );
        try {
          const rawData = forge.util.decode64(data);

          // Convert message to Uint8Array
          const messageArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; i++) {
            messageArray[i] = rawData.charCodeAt(i);
          }

          // Sign with Ed25519 using the full secret key (64 bytes)
          const signature = nacl.sign.detached(messageArray, keyPair.secretKey);

          console.log('Ed25519 signature generated, length:', signature.length);
          // Convert signature to base64
          return naclUtil.encodeBase64(signature);
        } catch (error) {
          console.error('Ed25519 signing error:', error);
          throw error;
        }
      };

      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithSignCallback(publicKey, signCallback);
      setStatus('Ed25519 Sign Callback Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`Ed25519 Sign Callback Failed: ${error.message}`);
    }
  };

  const testBadPassword = async () => {
    setStatus('Testing Bad Password...');
    try {
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithPassword('wrongpassword');
      setStatus('Bad Password: Unexpected Success!');
    } catch (error) {
      setStatus('Bad Password: Authentication Failed (Expected)');
      Alert.alert('Success', 'Bad password correctly rejected!');
    }
  };

  const testBadRSAKey = async () => {
    setStatus('Testing Bad RSA Key...');
    try {
      // This is a valid RSA key format but not authorized on the server
      const badPrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEA+hmTOoNduk0I6YkN//VM6bWJ4kAhce4jZBsHaiE7p8pQq4o4R2x3
e5HnsgMOQp6s6WiiZJupwmgpvQVt24r6JMyy6DqY/30vJwn64GP+zjMblPCbRcULzm2M3i
5q8ubu7kXoYXrjnIAIn69T7ScyTweNjyQcmerqV3d6FIeGeUyYbTrrTZT7a/zOOpEw4SMq
/Min7JstLPND6qH8jeqRL7b52bugW/6t4nwA69q3YuuoDfDw/TVLSyUqo6vLjmyEJdSAZY
X1jL/wtvJL7UzZ9lAQPPI4p5oskxoLzPbOUJFNvZRCL1HKkzPZpiD0fkMjgTQGLN5bnbp8
5xrEA6OEyQAAA9Bj0N6HY9DehwAAAAdzc2gtcnNhAAABAQD6GZM6g126TQjpiQ3/9UzptY
niQCFx7iNkGwdqITunylCrijhHbHd7keeyAw5CnqzpaKJkm6nCaCm9BW3bivokzLLoOpj/
fS8nCfrgY/7OMxuU8JtFxQvObYzeLmry5u7uRehheuOcgAifr1PtJzJPB42PJByZ6upXd3
oUh4Z5TJhtOutNlPtr/M46kTDhIyr8yKfsmy0s80PqofyN6pEvtvnZu6Bb/q3ifADr2rdi
66gN8PD9NUtLJSqjq8uObIQl1IBlhfWMv/C28kvtTNn2UBA88jinmiyTGgvM9s5QkU29lE
IvUcqTM9mmIPR+QyOBNAYs3ludunznGsQDo4TJAAAAAwEAAQAAAQBLMo9jA4aV8n2ggjX0
ZNQIXS4lGfU0ZU681aeoEG/4ZktVGI0NZJ6UR+1rR6HtA/qnf298YpVrP5h1HgHHBgVqNS
YBz0SbZQ9dZJHLECXX5+P+J034b2O6YJP/ZeOAP1FN0TUqwiFXt+Nf5/6LCsMEohe9FzWG
TezB+cl6DLmxFG+C1Ovkeci6HWfmAA4wcey71Mwm1iHd6Bnxk93rvI2NUp1uEY5OOwAjQJ
iW3axcZCYektCG4MfHsJwvZdKlyjf4xWj+nJabCtQAmRN/G94S+3mWx4Scc8UripWZgVb+
YBgBbtn3kgNTexDTep/O2ELPb/sClU3oq9k/iUrgxDllAAAAgQDGkC8IdJoej9+8vPlbFQ
5aMYO0RkJg7S0EYTONA9dWbaGvy6uH5LNuxif9UYBavn9i3qlnMnOT8Rg3bchjFlYwkMei
nsz9I3HqiTg+VbCjnMl58jRAkZlcsdzHKhqkQWE0wUivrIcPgu4kUjc1k6RxTahePtaGfb
UnY6zlcEwx0AAAAIEA/d7BlW+YAdsdVlEEsR+6FeeDv0ZGpb7Y06qpIhk43nlEV2FEtXs/
lJaFjo2tPEzIsYESqVghs7Sy2MSF+DLpTHBdlNhAwPv2AX56K7d03kc2xQ7NYcX3bGZsHL
5GieS+3vYFRDuvH5/EvdZXbhufvOpD8jCDT9OypqB40WN4+PMAAACBAPwyuLL8Z+FdI3dm
fWnOX+hvHMPPa0SqZdgEp5+LQSKIgdne9/iw16Xw18aMMMps7VBkFqLgQywCyqocVpUlRj
ZHp4MIrucCp598RYJcEsSTUMlWsHs2ffnuZphPpcAk5kq/NPEcSVa08G+xB7mhlPIPAlam
xpWXeGkW2vnB3XpTAAAAFXVuYXV0aG9yaXplZEB0ZXN0LmNvbQECAwQF
-----END OPENSSH PRIVATE KEY-----`;
      const client = await SSHClient.connect(HOST, PORT, 'user');
      await client.authenticateWithKey(badPrivateKey);
      setStatus('Bad RSA Key: Unexpected Success!');
    } catch (error) {
      setStatus('Bad RSA Key: Authentication Failed (Expected)');
      Alert.alert('Success', 'Bad RSA key correctly rejected!');
    }
  };

  return (
    <View style={styles.container} testID="main-container">
      <Text style={styles.title} testID="title">
        SSH SFTP Example
      </Text>
      <Text style={styles.status} testID="status">
        Status: {status}
      </Text>
      <ScrollView style={styles.scrollView} testID="scroll-view">
        <TouchableOpacity
          style={styles.button}
          onPress={testConnection}
          testID="test-button"
        >
          <Text style={styles.buttonText}>Test SSH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testDockerConnection}
          testID="docker-test-button"
        >
          <Text style={styles.buttonText}>Docker SSH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testRSAKey}
          testID="rsa-key-button"
        >
          <Text style={styles.buttonText}>RSA Key</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testOpenSSHKey}
          testID="openssh-key-button"
        >
          <Text style={styles.buttonText}>OpenSSH Key</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testEncryptedRSAKey}
          testID="encrypted-rsa-key-button"
        >
          <Text style={styles.buttonText}>Encrypted RSA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testSFTP}
          testID="sftp-test-button"
        >
          <Text style={styles.buttonText}>SFTP Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testSignCallback}
          testID="sign-callback-button"
        >
          <Text style={styles.buttonText}>RSA 2048 Sign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testRSA2048SHA256SignCallback}
          testID="rsa2048-sha256-sign-callback-button"
        >
          <Text style={styles.buttonText}>RSA 2048 SHA256 Sign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testRSA4096SignCallback}
          testID="rsa4096-sign-callback-button"
        >
          <Text style={styles.buttonText}>RSA 4096 Sign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testECDSASignCallback}
          testID="ecdsa-sign-callback-button"
        >
          <Text style={styles.buttonText}>ECDSA P-256 Sign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testEd25519SignCallback}
          testID="ed25519-sign-callback-button"
        >
          <Text style={styles.buttonText}>Ed25519 Sign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testBadPassword}
          testID="bad-password-button"
        >
          <Text style={styles.buttonText}>Bad Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={testBadRSAKey}
          testID="bad-rsa-key-button"
        >
          <Text style={styles.buttonText}>Bad RSA Key</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 2,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
