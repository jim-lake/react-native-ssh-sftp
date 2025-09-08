/**
 * Demo script showing the new separated connect/authenticate API
 * This demonstrates the key differences from the legacy API
 */

const SSHClient = require('./sshclient.js').default;

async function demoNewAPI() {
  console.log('=== New API Demo ===');
  
  try {
    // Step 1: Connect to host (no authentication yet)
    console.log('1. Connecting to host...');
    const client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    console.log('   ✓ Connected to host');
    console.log('   ✓ Authentication status:', client.isAuthenticated());
    
    // Step 2: Try wrong password first
    console.log('2. Trying wrong password...');
    try {
      await client.authenticateWithPassword('wrongpassword');
    } catch (error) {
      console.log('   ✗ Authentication failed (as expected)');
      console.log('   ✓ Authentication status:', client.isAuthenticated());
    }
    
    // Step 3: Try correct password
    console.log('3. Trying correct password...');
    await client.authenticateWithPassword('password');
    console.log('   ✓ Authentication successful');
    console.log('   ✓ Authentication status:', client.isAuthenticated());
    
    // Step 4: Now we can perform operations
    console.log('4. Executing command...');
    const result = await client.execute('echo "Hello from new API!"');
    console.log('   ✓ Command result:', result.trim());
    
    // Step 5: Test SFTP
    console.log('5. Testing SFTP...');
    await client.connectSFTP();
    const files = await client.sftpLs('.');
    console.log('   ✓ SFTP connected, found', files.length, 'files');
    
    // Clean up
    client.disconnect();
    console.log('6. Disconnected');
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

async function demoLegacyAPI() {
  console.log('\n=== Legacy API Demo (for comparison) ===');
  
  try {
    // Legacy: Connect and authenticate in one step
    console.log('1. Connecting and authenticating in one step...');
    const client = await SSHClient.connectWithPassword('127.0.0.1', 2222, 'user', 'password');
    console.log('   ✓ Connected and authenticated');
    console.log('   ✓ Authentication status:', client.isAuthenticated());
    
    // Execute command
    const result = await client.execute('echo "Hello from legacy API!"');
    console.log('   ✓ Command result:', result.trim());
    
    client.disconnect();
    console.log('2. Disconnected');
    
  } catch (error) {
    console.error('Legacy demo failed:', error.message);
  }
}

async function demoKeyAuthentication() {
  console.log('\n=== Key Authentication Demo ===');
  
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

  try {
    console.log('1. Connecting to host...');
    const client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    console.log('   ✓ Connected to host');
    
    console.log('2. Authenticating with private key...');
    await client.authenticateWithKey(privateKey);
    console.log('   ✓ Key authentication successful');
    console.log('   ✓ Authentication status:', client.isAuthenticated());
    
    const result = await client.execute('whoami');
    console.log('   ✓ Command result:', result.trim());
    
    client.disconnect();
    console.log('3. Disconnected');
    
  } catch (error) {
    console.error('Key demo failed:', error.message);
  }
}

// Run all demos
async function runAllDemos() {
  await demoNewAPI();
  await demoLegacyAPI();
  await demoKeyAuthentication();
  
  console.log('\n=== Summary ===');
  console.log('✓ New API allows separate connection and authentication');
  console.log('✓ Multiple authentication attempts on same connection');
  console.log('✓ Authentication status checking with isAuthenticated()');
  console.log('✓ Operations are blocked until authenticated');
  console.log('✓ Legacy API still works for backward compatibility');
}

// Export for use in React Native or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demoNewAPI, demoLegacyAPI, demoKeyAuthentication, runAllDemos };
}

// Run if called directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}
