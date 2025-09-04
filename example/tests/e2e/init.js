const detox = require('detox');
const config = require('../../package.json').detox;

beforeAll(async () => {
  await detox.init(config, {initGlobals: false});
});

beforeEach(async () => {
  await detox.beforeEach();
});

afterAll(async () => {
  await detox.cleanup();
});
