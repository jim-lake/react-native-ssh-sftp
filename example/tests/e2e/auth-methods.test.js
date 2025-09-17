const {device, element, by, expect: detoxExpected} = require('detox');

describe('SSH SFTP Authentication Methods Tests', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 30000);

  afterEach(async () => {
    // Dismiss any alert dialogs that might be open
    try {
      await element(by.label('OK')).atIndex(0).tap();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // No alert to dismiss, continue
    }
  });

  it('should test Docker SSH password authentication', async () => {
    await element(by.id('docker-test-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 7300));
    // Check that authentication succeeded
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Docker SSH Connected!');
  });

  it('should test RSA key authentication', async () => {
    await element(by.id('rsa-key-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 4800));
    // Check that authentication succeeded
    await detoxExpected(element(by.id('status'))).toHaveText('Status: RSA Key Connected!');
  });

  it('should test OpenSSH key authentication', async () => {
    await element(by.id('openssh-key-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 4800));
    // Check that authentication succeeded
    await detoxExpected(element(by.id('status'))).toHaveText('Status: OpenSSH Key Connected!');
  });

  it('should test encrypted RSA key authentication', async () => {
    await element(by.id('encrypted-rsa-key-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3600));
    // Check that authentication succeeded
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Encrypted RSA Key Connected!');
  });

  it('should test SFTP functionality', async () => {
    await element(by.id('sftp-test-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 5800));
    // Check that SFTP connection succeeded and files were listed
    await detoxExpected(element(by.id('status'))).toHaveText('Status: SFTP Connected! Found 1 files');
  });

  it('should test sign callback authentication', async () => {
    await element(by.id('sign-callback-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 6800));
    // Check that sign callback authentication failed as expected (mock implementation)
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Sign Callback Failed: Sign callback authentication failed with error code -19');
  });

  it('should test basic SSH functionality', async () => {
    await element(by.id('test-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3600));
    // Check that basic SSH test completed as expected
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Native call successful (connection failed as expected)');
  });
});
