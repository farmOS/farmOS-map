const fs = require('fs');
const { performance } = require('perf_hooks');
const { v4: uuidv4 } = require('uuid');

const createNetworkThrottledScenario = (params) => {
  return async (page, client) => {
    await client.send('Network.emulateNetworkConditions', params);
  };
};

const TEST_RUN_ID = process.env.TEST_RUN_ID || uuidv4();

const TEST_SCENARIOS = {
  'Unthrottled': async (page, client) => {},
  'Regular2G': createNetworkThrottledScenario({
    'offline': false,
    'downloadThroughput': 250 * 1024 / 8,
    'uploadThroughput': 50 * 1024 / 8,
    'latency': 300
  }),
  'Regular4G': createNetworkThrottledScenario({
    'offline': false,
    'downloadThroughput': 4 * 1024 * 1024 / 8,
    'uploadThroughput': 3 * 1024 * 1024 / 8,
    'latency': 20
  }),
  'DSL': createNetworkThrottledScenario({
    'offline': false,
    'downloadThroughput': 2 * 1024 * 1024 / 8,
    'uploadThroughput': 1 * 1024 * 1024 / 8,
    'latency': 5
  }),
  'SlowCPU': async (page, client) => {
    await client.send('Emulation.setCPUThrottlingRate', { rate: 8 });
  },
}

beforeAll(async () => {
  await fs.mkdirSync(`${process.cwd()}/perfData/${TEST_RUN_ID}`, { recursive: true });
});

describe('PerformanceTest', () => {

  const testTable = Object.entries(TEST_SCENARIOS).flatMap(([scenarioName, scenarioFn]) => {
    return ['uncached', 'cached'].map((stage) => {

      const testName = `${scenarioName}-${stage}`;

      // These are the args passed to our test
      return [
        testName,
        scenarioName,
        scenarioFn,
        stage,
      ];
    });
  });

  test.each(testTable)('%s', async (testName, scenarioName, scenarioFn, stage) => {
    const page = await browser.newPage();

    page.setCacheEnabled(true);

    const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    if (stage === 'uncached') {
      await client.send('Network.clearBrowserCache');
    }

    await scenarioFn(page, client);

    const testCaseId = uuidv4();

    const sentinelNavPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goto(`http://0.0.0.0:${process.env.TEST_PORT_NUM}/sentinel.html`);
    await sentinelNavPromise;

    await page.waitForSelector('#sentinel-div');

    const navPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });

    const start = performance.now();

    await page.goto(`http://0.0.0.0:${process.env.TEST_PORT_NUM}/`);
    await navPromise;

    const end = performance.now();

    const navToNetIdle = end - start;

    await page.screenshot({ path: `perfData/${TEST_RUN_ID}/${testCaseId}.png` });

    const perfEntries = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.getEntries()))
    );

    const firstContentfulPaint = perfEntries
      .find(e => e.entryType === 'paint' && e.name === 'first-contentful-paint')
      .startTime;

    const jsEntries = perfEntries
      .filter(e => e.entryType === 'resource' && e.name.endsWith('.js'));

    const jsTotalTransferBytes = jsEntries
      .map(e => e.transferSize)
      .reduce((a, b) => a + b, 0);

    const jsTotalDecodedBytes = jsEntries
      .map(e => e.decodedBodySize)
      .reduce((a, b) => a + b, 0);

    const sample = {
      scenario: `${scenarioName}-${stage}`,
      data: {
        'first-contentful-paint': firstContentfulPaint,
        'nav-to-net-idle': navToNetIdle,
        'js-resource-count': jsEntries.length,
        'js-resource-total-transfer-bytes': jsTotalTransferBytes,
        'js-resource-total-decoded-bytes': jsTotalDecodedBytes,
      },
    };

    fs.writeFileSync(`perfData/${TEST_RUN_ID}/${testCaseId}.json`, JSON.stringify(sample));

    await client.detach();
  }, 30 * 1000);

});
