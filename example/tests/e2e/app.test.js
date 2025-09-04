const {device, element, by, expect: detoxExpect} = require('detox');

describe('SSH SFTP Example App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should launch without crashing', async () => {
    // This test passes if the app launches successfully
    // and doesn't crash within a reasonable time
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('should connect to Docker SSH server', async () => {
    // Tap the Docker SSH test button
    await element(by.id('docker-test-button')).tap();
    
    // Wait for the connection attempt to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check that the status shows success
    await detoxExpect(element(by.id('status'))).toHaveText('Status: Docker SSH Connected!');
  });

  it('should be able to terminate gracefully', async () => {
    await device.terminateApp();
    await device.launchApp();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
