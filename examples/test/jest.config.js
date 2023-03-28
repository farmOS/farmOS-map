const fs = require('fs');


process.env.JEST_PUPPETEER_CONFIG = `${process.cwd()}/../test/jest-puppeteer.config.js`;

if (!process.env.TEST_PORT_NUM) {
  process.env.TEST_PORT_NUM = '1234';
}

module.exports = {
  preset: 'jest-puppeteer',
  verbose: false,
  rootDir: process.cwd(),
  roots: [
    process.cwd(),
    '../test/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'index.spec.js',
  ],
  reporters: [
    `${__dirname}/custom-performance-reporter.js`,
    'default',
  ],
};
