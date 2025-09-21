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

  it('should test RSA 2048 sign callback authentication', async () => {
    await element(by.id('sign-callback-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 6800));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: RSA 2048 Sign Callback Connected!');
  });

  it('should test ECDSA P-256 sign callback authentication', async () => {
    await element(by.id('ecdsa-sign-callback-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 6800));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: ECDSA P-256 Sign Callback Connected!');
  });

  it('should test Ed25519 sign callback authentication', async () => {
    await element(by.id('ed25519-sign-callback-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 6800));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Ed25519 Sign Callback Connected!');
  });

  it('should test bad password authentication (expected failure)', async () => {
    await element(by.id('bad-password-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3600));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Bad Password: Authentication Failed (Expected)');
  });

  it('should test bad RSA key authentication (expected failure)', async () => {
    await element(by.id('bad-rsa-key-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3600));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Bad RSA Key: Authentication Failed (Expected)');
  });

  it('should test basic SSH functionality', async () => {
    await element(by.id('test-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3600));
    // Check that basic SSH test completed as expected
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Native call successful (connection failed as expected)');
  });
});
