import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView} from 'react-native';
import SSHClient from 'react-native-ssh-sftp';
import forge from 'node-forge';

import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';

const NATIVE_EVENT_SHELL = 'Shell';
const NATIVE_EVENT_DOWNLOAD_PROGRESS = 'DownloadProgress';
const NATIVE_EVENT_UPLOAD_PROGRESS = 'UploadProgress';
const NATIVE_EVENT_SIGN_CALLBACK = 'SignCallback';


const RNSSHClient = NativeModules.RNSSHClient;

const emitter = new NativeEventEmitter(RNSSHClient);

emitter.addListener('SignCallback', (event) => {
  console.log("App.SignCallback:", event);
});

// this is because event emitter don't work right in this example because voodoo
SSHClient.setClient(RNSSHClient, emitter);

const HOST = '127.0.0.1';
const PORT = 2222;

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
      const errnoMsg = error.errno !== undefined ? ` (errno: ${error.errno})` : '';
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
    console.log('=== STARTING SIGN CALLBACK TEST ===');
    setStatus('Testing Sign Callback...');
    
    try {
      // Use the actual working public key from test environment
      const publicKeySSH = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/XulQBQ2ms2sA+0QIe5XPWdmGDqb5oBzBjODFUQPIdF9etRRlEfQQDS6+YGailP/F+WGMWN3OvWHBTVwEXkxSzPc0qfG5sqdqeQf/1STvkN+I98SWYIaKEkv0IVe5eTAMr8atA8gzX3w9XHoqtg4aeeZtz5uBgd3q2YdG9RiRkTMJ4YHT5TzQSFJy+FCuV4SP4SaU/Zv5Q/grZTsMcBal1tziu3xnuYH5vJmvFXXDPwUiJ6da+oUYf7D+wsqlL8/KDyiRPg2VX+E9rIoNe2J56MWjUoqoa/45Y7TaND8zN9fxTw6bgU9W9Yre5JpLaR9KtvoETe6lIprc5IV54PWx test-agent@nmssh`;
      
      console.log('1. Full SSH public key:', publicKeySSH);
      
      // Extract base64 part and decode it to get the actual SSH wire format data
      const parts = publicKeySSH.split(' ');
      console.log('2. SSH key parts:', parts);
      const publicKey = parts[1];
      console.log('3. Extracted base64 public key:', publicKey);
      console.log('4. Base64 public key length:', publicKey.length);
      
      // Use the actual working private key from test environment
      const privateKeyPem = `
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
`;
      
      console.log('Private key PEM length:', privateKeyPem.length);
      
      let testPrivateKey;
      try {
        testPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        console.log('Private key parsed successfully');
        console.log('Private key modulus length:', testPrivateKey.n.bitLength());
        //console.log('Private key:', testPrivateKey);
      } catch (keyError) {
        console.error('FAILED to parse private key:', keyError);
        throw keyError;
      }
      
      const signCallback = async (data) => {
        console.log('=== SIGN CALLBACK INVOKED ===');
        console.log('Received data parameter:', typeof data, data);
        console.log('Data length:', data ? data.length : 'null/undefined');
        
        try {
          if (!data) {
            console.error('ERROR: No data provided to sign callback');
            throw new Error('No data provided to sign callback');
          }
          
          console.log('Attempting to decode base64 data...');
          const rawData = forge.util.decode64(data);
          console.log('Raw data decoded successfully, length:', rawData.length);
          console.log('Raw data (hex):', forge.util.bytesToHex(rawData));

          console.log('Parsing private key...');

          console.log('Creating SHA1 hash...');
          const md = forge.md.sha1.create();
          md.update(rawData);
          const hash = md.digest();
          console.log('SHA1 hash created, length:', hash.length());
          console.log('SHA1 hash (hex):', forge.util.bytesToHex(hash.data));
          
          console.log('Signing hash with private key...');
          const signature = testPrivateKey.sign(md);
          console.log('Signature created, length:', signature.length);
          console.log('Signature (hex):', forge.util.bytesToHex(signature));
          
          console.log('Encoding signature as base64...');
          const signatureBase64 = forge.util.encode64(signature);
          console.log('Signature base64 length:', signatureBase64.length);
          console.log('Signature (base64):', signatureBase64);
          
          console.log('SIGN CALLBACK RETURNING SUCCESS');
          return signatureBase64;
        } catch (error) {
          console.error('SIGN CALLBACK ERROR:', error);
          console.error('Error stack:', error.stack);
          throw error;
        }
      };
      
      console.log('Creating SSH client connection...');
      const client = await SSHClient.connect(HOST, PORT, 'user');
      console.log('SSH client connected successfully');
      
      console.log('Starting sign callback authentication...');
      console.log('Passing public key data (base64):', publicKey);
      await client.authenticateWithSignCallback(publicKey, signCallback);
      console.log('Sign callback authentication completed successfully');
      
      setStatus('Sign Callback Connected!');
      client.disconnect();
      console.log('SSH client disconnected');
      console.log('=== SIGN CALLBACK TEST COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== SIGN CALLBACK TEST FAILED ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error object:', error);
      setStatus(`Sign Callback Failed: ${error.message}`);
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
      <Text style={styles.title} testID="title">SSH SFTP Example</Text>
      <Text style={styles.status} testID="status">Status: {status}</Text>
      <ScrollView style={styles.scrollView} testID="scroll-view">
        <TouchableOpacity style={styles.button} onPress={testConnection} testID="test-button">
          <Text style={styles.buttonText}>Test SSH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testDockerConnection} testID="docker-test-button">
          <Text style={styles.buttonText}>Docker SSH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testRSAKey} testID="rsa-key-button">
          <Text style={styles.buttonText}>RSA Key</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testOpenSSHKey} testID="openssh-key-button">
          <Text style={styles.buttonText}>OpenSSH Key</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testEncryptedRSAKey} testID="encrypted-rsa-key-button">
          <Text style={styles.buttonText}>Encrypted RSA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testSFTP} testID="sftp-test-button">
          <Text style={styles.buttonText}>SFTP Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testSignCallback} testID="sign-callback-button">
          <Text style={styles.buttonText}>Sign Callback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testBadPassword} testID="bad-password-button">
          <Text style={styles.buttonText}>Bad Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testBadRSAKey} testID="bad-rsa-key-button">
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
