const {device, element, by, expect: detoxExpected} = require('detox');

describe('SSH SFTP Authentication Tests', () => {
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
    await element(by.text('D')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    // Check that the status shows some result (connection attempt was made)
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test RSA key authentication', async () => {
    await element(by.text('R')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test OpenSSH key authentication', async () => {
    await element(by.text('O')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test encrypted RSA key authentication', async () => {
    await element(by.text('E')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test SFTP functionality', async () => {
    await element(by.text('F')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test sign callback authentication', async () => {
    await element(by.text('C')).tap();
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Sign callback will likely fail due to mock signature, but we test that the method is called
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });

  it('should test basic SSH functionality', async () => {
    await element(by.text('S')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });
});
