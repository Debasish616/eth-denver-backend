const { expect } = require('chai');
const { runArbitrage } = require('../src/main');

describe('ArbAgent', () => {
  it('should run without errors', async () => {
    await expect(runArbitrage()).to.not.be.rejected;
  });
});