describe('Detox Server Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should connect to Detox server', async () => {
    await expect(element(by.id('main-container'))).toBeVisible();
  });
});
