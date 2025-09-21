const { device, element, by, expect: detoxExpected } = require('detox');

describe('SSH SFTP Basic App Tests', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 30000);

  it('should display main UI elements', async () => {
    // Check that title is visible
    await detoxExpected(element(by.id('title'))).toBeVisible();
    await detoxExpected(element(by.id('title'))).toHaveText('SSH SFTP Example');

    // Check that status is visible
    await detoxExpected(element(by.id('status'))).toBeVisible();
    await detoxExpected(element(by.id('status'))).toHaveText('Status: Ready');

    // Check that scroll view is visible
    await detoxExpected(element(by.id('scroll-view'))).toBeVisible();
  });

  it('should display all authentication method buttons', async () => {
    // Check that all buttons are visible
    await detoxExpected(element(by.id('test-button'))).toBeVisible();
    await detoxExpected(element(by.id('docker-test-button'))).toBeVisible();
    await detoxExpected(element(by.id('rsa-key-button'))).toBeVisible();
    await detoxExpected(element(by.id('openssh-key-button'))).toBeVisible();
    await detoxExpected(
      element(by.id('encrypted-rsa-key-button')),
    ).toBeVisible();
    await detoxExpected(element(by.id('sftp-test-button'))).toBeVisible();
    await detoxExpected(element(by.id('sign-callback-button'))).toBeVisible();
    await detoxExpected(element(by.id('bad-password-button'))).toBeVisible();
    await detoxExpected(element(by.id('bad-rsa-key-button'))).toBeVisible();
  });
});
