const {device, element, by, expect: detoxExpected} = require('detox');

describe('SSH SFTP Negative Authentication Tests', () => {
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

  it('should reject bad password authentication', async () => {
    await element(by.text('BP')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    // Check that authentication failed as expected
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Bad Password: Authentication Failed (Expected)');
  });

  it('should reject unauthorized RSA key authentication', async () => {
    await element(by.text('BR')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    // Check that authentication failed as expected
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Bad RSA Key: Authentication Failed (Expected)');
  });
});
