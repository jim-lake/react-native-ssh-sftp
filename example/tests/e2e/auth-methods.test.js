const {device, element, by, expect: detoxExpected} = require('detox');

describe('SSH SFTP Authentication Tests', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 30000);

  it('should test Docker SSH password authentication', async () => {
    await element(by.text('D')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Docker SSH Connected!');
    await element(by.label('OK')).atIndex(0).tap();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should test RSA key authentication', async () => {
    await element(by.text('R')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: RSA Key Connected!');
  });

  it('should test OpenSSH key authentication', async () => {
    await element(by.text('O')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: OpenSSH Key Connected!');
  });

  it('should test encrypted RSA key authentication', async () => {
    await element(by.text('E')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Encrypted RSA Key Connected!');
  });

  it('should test SFTP functionality', async () => {
    await element(by.text('F')).tap();
    await new Promise(resolve => setTimeout(resolve, 4000));
    await detoxExpected(element(by.id('status'))).toHaveText('Status: SFTP Connected! Found 3 files');
  });

  it('should test basic SSH functionality', async () => {
    await element(by.text('S')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await detoxExpected(element(by.id('status'))).not.toHaveText('Status: Ready');
  });
});
