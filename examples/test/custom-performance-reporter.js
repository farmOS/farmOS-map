// Based on https://github.com/tomenden/jest-add-summary-reporter/blob/079aad30424043c9c2c71724660da63e6220cc72/index.js#L1-L82
// Licensed under MIT per https://github.com/tomenden/jest-add-summary-reporter/blob/079aad30424043c9c2c71724660da63e6220cc72/package.json#L11

const { relative } = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const glob = require('glob');
const fs = require('fs');

const TESTS_KEY = '@@TEST_KEY@@';
const PASSED_TEST_STATUS = 'passed';


process.env.TEST_RUN_ID = process.env.TEST_RUN_ID || uuidv4();

const style = {
  file: chalk.bold.white,
  title: chalk.grey,
  describe: chalk.white,
  heading: chalk.bold.cyan.underline,
  failedSuites: chalk.yellow,
  failedTests: chalk.red,
};

const redX = chalk.red('✕');
const greenCheck = chalk.green('✓');
const INDENT = '  ';

class CustomPerformanceReporter {
  constructor({ rootDir }) {
    this.rootDir = rootDir;
  }

  onRunStart(results, options) {
    results.testRunId = process.env.TEST_RUN_ID;
  }

  generateTestTree(tests) {
    if (tests.length === 0) return;

    const tree = _(_.cloneDeep(tests))
      .groupBy(
        test => (test.ancestorTitles.length > 0
          ? test.ancestorTitles.shift()
          : TESTS_KEY),
      )
      .value();
    return _.mapValues(tree, (value, key) => {
      if (key === TESTS_KEY) return value;
      return this.generateTestTree(value);
    });
  }

  logTestTree(tree, perfDataSamples, indentLevel = 1) {
    _.forEach(tree, (childTree, key) => {
      if (key === TESTS_KEY) {
        _.forEach(childTree, (test) => {
          const symbol = (test.status == PASSED_TEST_STATUS) ? greenCheck : redX;
          console.log(`${INDENT.repeat(indentLevel)}${symbol} ${style.title(test.title)}`);

          if (test.fullName.startsWith('PerformanceTest')) {
            const samplesForScenario = perfDataSamples.filter(s => s.scenario === test.title);

            const firstContentfulPaint = avgArray(samplesForScenario.map(sample => sample.data['first-contentful-paint'])).toFixed(2);
            const navToNetIdle = avgArray(samplesForScenario.map(sample => sample.data['nav-to-net-idle'])).toFixed(2);

            console.log(`${INDENT.repeat(indentLevel + 1)}- first-contentful-paint: ${firstContentfulPaint}ms`);
            console.log(`${INDENT.repeat(indentLevel + 1)}- nav-to-net-idle: ${navToNetIdle}ms`);
          }

        });
      } else {
        console.log(`${INDENT.repeat(indentLevel)}${style.describe(key)}`);
        this.logTestTree(childTree, perfDataSamples, indentLevel + 1);
      }
    });
  }

  onRunComplete(contexts, results) {
    const { numFailedTestSuites, numFailedTests, testResults } = results;

    // Add a blank line before the test summary
    console.log('');

    console.log(style.heading(`Test summary (testRunId=${results.testRunId}):`));

    const perfDataSampleFiles = glob.sync(`./perfData/${results.testRunId}/*.json`);

    const perfDataSamples = perfDataSampleFiles.map(file => JSON.parse(fs.readFileSync(file)));

    for (const testFile of testResults) {
      console.log(style.file(relative(this.rootDir, testFile.testFilePath)));
      const testsTree = this.generateTestTree(testFile.testResults);
      this.logTestTree(testsTree, perfDataSamples, 1);
    }
  }
}

function avgArray(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = CustomPerformanceReporter;
