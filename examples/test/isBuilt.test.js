const fs = require('fs');

describe('Validate example has been built', () => {
  it(`Confirm sentinel.html exists in dist folder`, async () => {
    expect(fs.existsSync('./dist/sentinel.html')).toBe(true);
  });
});
