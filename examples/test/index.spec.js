const fs = require('fs');
const spawn = require('cross-spawn');
const { resolve } = require('path');
const getPort = require('get-port');
const glob = require('glob');
const { v4: uuidv4 } = require('uuid');


const pkg = require('../package.json');


process.env.TEST_RUN_ID = process.env.TEST_RUN_ID || uuidv4();

const exampleApps = pkg.workspaces.packages;

const TEST_ITERATIONS = 10;

function spawnAsPromise(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.on('close', (code) => {
      code === 0 ? resolve(true) : reject(false);
    });
    child.on('error', () => {
      reject(false);
    });
  });
}

const counter = 0;

exampleApps.forEach((app) => {

  describe(`${app}`, () => {

    it('should build', async () => {
      const result = await spawnAsPromise('npm', ['run', 'build'], { cwd: app });
      expect(result).toEqual(true);
    }, 60 * 1000);

    describe(`get metrics from ${TEST_ITERATIONS} perf.test.js runs`, () => {
      for (let index = 0; index < TEST_ITERATIONS; index++) {
        it(`${app} run #${index}`, async () => {
          const env = Object.assign({}, process.env);
          env.TEST_PORT_NUM = await getPort({ port: getPort.makeRange(3000, 3100) });

          const result = await spawnAsPromise('npm', ['test', '../test/perf.test.js'], { cwd: app, env });
          expect(result).toEqual(true);
        }, 300 * 1000);
      }
    });

  });
});

afterAll(async () => {
  const avgMetrics = {};

  exampleApps.forEach((app) => {
    const files = glob.sync(`./${app}/perfData/${process.env.TEST_RUN_ID}/*.json`);

    const samples = files.map(file => JSON.parse(fs.readFileSync(file)));

    Array.from(new Set(samples.map(s => s.scenario))).forEach((scenario) => {
      const samplesForScenario = samples.filter(s => s.scenario === scenario);

      const key = `${app}/${scenario}`;

      avgMetrics[key] = {};

      Object.keys(samples[0].data).forEach(metricName => avgMetrics[key][metricName] = avgArray(samplesForScenario.map(sample => sample.data[metricName])));

    });

  });

  console.log(avgMetrics);
});

function avgArray(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
