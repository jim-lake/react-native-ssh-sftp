describe('Detox Server Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should connect to Detox server', async () => {
    // Check if the main container is visible, fallback to title if not
    try {
      await expect(element(by.id('main-container'))).toBeVisible();
    } catch (error) {
      // Fallback to title element if main container visibility fails
      await expect(element(by.id('title'))).toBeVisible();
    }
  });
});
