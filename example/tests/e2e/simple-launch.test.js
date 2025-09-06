const {device, element, by, expect: detoxExpect} = require('detox');

describe('Simple App Launch Test', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  it('should launch the app successfully', async () => {
    // Wait for the app to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the main container is visible
    await detoxExpect(element(by.id('main-container'))).toBeVisible();
  });

  it('should display the title', async () => {
    await detoxExpect(element(by.id('title'))).toHaveText('SSH SFTP Example');
  });
});
