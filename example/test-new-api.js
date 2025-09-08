const SSHClient = require('./sshclient.js').default;

async function testNewAPI() {
  console.log('Testing new separated API...');
  
  try {
    // Step 1: Connect only
    const client = await SSHClient.connect('127.0.0.1', 2222, 'user');
    console.log('✓ Connected to host');
    console.log('✓ Authenticated:', client.isAuthenticated());
    
    // Step 2: Authenticate
    await client.authenticateWithPassword('password');
    console.log('✓ Password authentication successful');
    console.log('✓ Authenticated:', client.isAuthenticated());
    
    client.disconnect();
    console.log('✓ Test completed successfully');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

testNewAPI();
