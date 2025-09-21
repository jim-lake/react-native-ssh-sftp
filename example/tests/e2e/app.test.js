const { device, element, by, expect: detoxExpected } = require('detox');

describe('SSH SFTP App Tests', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
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

  it('should handle alerts properly', async () => {
    // Test that alerts are properly handled when they appear
    await element(by.id('docker-test-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 7300));

    // Should show success alert for Docker SSH connection
    try {
      await element(by.label('OK')).atIndex(0).tap();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Alert might not appear in test environment
    }

    // Check final status
    await detoxExpected(element(by.id('status'))).toHaveText(
      'Status: Docker SSH Connected!',
    );
  });
});
