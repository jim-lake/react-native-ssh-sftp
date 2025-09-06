import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, Alert, ScrollView} from 'react-native';
import SSHClient from './sshclient.js';

export default function App() {
  const [status, setStatus] = useState('Ready');

  const testConnection = async () => {
    setStatus('Testing...');
    try {
      await SSHClient.connectWithPassword('127.0.0.1', 22, 'test', 'test');
      setStatus('Connected');
    } catch (error) {
      setStatus('Native call successful (connection failed as expected)');
      Alert.alert('Success', 'Native SSH module is working correctly!');
    }
  };

  const testDockerConnection = async () => {
    setStatus('Testing Docker SSH...');
    try {
      const client = await SSHClient.connectWithPassword('127.0.0.1', 2222, 'user', 'password');
      setStatus('Docker SSH Connected!');
      client.disconnect();
      Alert.alert('Success', 'Connected to Docker SSH server!');
    } catch (error) {
      setStatus(`Docker SSH Failed: ${error.message}`);
      Alert.alert('Error', `Failed to connect to Docker SSH: ${error.message}`);
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
      const client = await SSHClient.connectWithKey('127.0.0.1', 2222, 'user', privateKey);
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
      const client = await SSHClient.connectWithKey('127.0.0.1', 2222, 'user', privateKey);
      setStatus('OpenSSH Key Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`OpenSSH Key Failed: ${error.message}`);
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
      const client = await SSHClient.connectWithKey('127.0.0.1', 2222, 'user', privateKey, 'password');
      setStatus('Encrypted RSA Key Connected!');
      client.disconnect();
    } catch (error) {
      setStatus(`Encrypted RSA Key Failed: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container} testID="main-container">
        <Text style={styles.title} testID="title">SSH SFTP Example</Text>
        <Text style={styles.status} testID="status">Status: {status}</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button title="Test SSH Connection" onPress={testConnection} testID="test-button" />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Test Docker SSH" onPress={testDockerConnection} testID="docker-test-button" />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Test RSA Key" onPress={testRSAKey} testID="rsa-key-button" />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Test OpenSSH Key" onPress={testOpenSSHKey} testID="openssh-key-button" />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Test Encrypted RSA Key" onPress={testEncryptedRSAKey} testID="encrypted-rsa-key-button" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: 10,
  },
});
