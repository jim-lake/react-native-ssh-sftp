const {device} = require('detox');

describe('SSH SFTP Example App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should launch without crashing', async () => {
    // This test passes if the app launches successfully
    // and doesn't crash within a reasonable time
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('should be able to terminate gracefully', async () => {
    await device.terminateApp();
    await device.launchApp();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
