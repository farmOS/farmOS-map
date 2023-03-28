module.exports = {
  launch: {
    headless: true,
    dumpio: false,
  },
  server: {
    command: 'npm run serve-dist',
    port: process.env.TEST_PORT_NUM,
    launchTimeout: 10000,
    usedPortAction: 'kill',
  },
};
