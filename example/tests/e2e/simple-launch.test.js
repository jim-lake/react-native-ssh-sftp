const { device, element, by, expect: detoxExpected } = require('detox');

describe('SSH SFTP Simple Launch Tests', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 30000);

  it('should launch app successfully', async () => {
    // Check that the app launched and main elements are present
    await detoxExpected(element(by.id('title'))).toBeVisible();
    await detoxExpected(element(by.id('title'))).toHaveText('SSH SFTP Example');
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Ready');
  });
});
