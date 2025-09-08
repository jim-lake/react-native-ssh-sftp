/**
 * @format
 */

import 'react-native';
import SSHClient from '../sshclient.js';

describe('New Authentication API', () => {
  let client;

  afterEach(() => {
    if (client) {
      client.disconnect();
      client = null;
    }
  });

  it('should connect and authenticate with password separately', async () => {
    // Connect first
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    expect(client.isAuthenticated()).toBe(false);

    // Then authenticate
    await client.authenticateWithPassword('password');
    expect(client.isAuthenticated()).toBe(true);
  });

  it('should connect and authenticate with key separately', async () => {
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

    // Connect first
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    expect(client.isAuthenticated()).toBe(false);

    // Then authenticate
    await client.authenticateWithKey(privateKey);
    expect(client.isAuthenticated()).toBe(true);
  });

  it('should connect and authenticate with encrypted key separately', async () => {
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

    // Connect first
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    expect(client.isAuthenticated()).toBe(false);

    // Then authenticate with passphrase
    await client.authenticateWithKey(privateKey, 'password');
    expect(client.isAuthenticated()).toBe(true);
  });

  it('should allow multiple authentication attempts on same connection', async () => {
    // Connect first
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    expect(client.isAuthenticated()).toBe(false);

    // Try wrong password first
    try {
      await client.authenticateWithPassword('wrongpassword');
    } catch (error) {
      expect(client.isAuthenticated()).toBe(false);
    }

    // Then try correct password
    await client.authenticateWithPassword('password');
    expect(client.isAuthenticated()).toBe(true);
  });

  it('should reject operations when not authenticated', async () => {
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    expect(client.isAuthenticated()).toBe(false);

    // Should reject execute
    await expect(client.execute('ls')).rejects.toThrow('Client is not authenticated');

    // Should reject SFTP
    await expect(client.connectSFTP()).rejects.toThrow('Client is not authenticated');
  });

  it('should allow operations after authentication', async () => {
    client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    await client.authenticateWithPassword('password');
    expect(client.isAuthenticated()).toBe(true);

    // Should allow execute
    const result = await client.execute('echo "test"');
    expect(result).toContain('test');

    // Should allow SFTP
    await client.connectSFTP();
    const files = await client.sftpLs('.');
    expect(Array.isArray(files)).toBe(true);
  });
});
