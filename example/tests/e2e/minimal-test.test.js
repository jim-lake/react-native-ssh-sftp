const {device, element, by, expect: detoxExpect} = require('detox');

describe('Minimal App Test', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    // Wait longer for the app to fully initialize
    await new Promise(resolve => setTimeout(resolve, 10000));
  }, 60000);

  it('should eventually become ready', async () => {
    // Just try to find any element to verify the app loaded
    try {
      await detoxExpect(element(by.id('main-container'))).toBeVisible();
    } catch (error) {
      console.log('Main container not found, trying title...');
      await detoxExpect(element(by.id('title'))).toBeVisible();
    }
  }, 30000);
});
