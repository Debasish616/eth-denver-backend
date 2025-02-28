const { expect } = require("chai");
const hre = require("hardhat");

describe("SwapForNUSD", function () {
  let swap, nusd, corebtc, owner, user;

  beforeEach(async function () {
    [owner, user] = await hre.ethers.getSigners();
    const MockCoreBTC = await hre.ethers.getContractFactory("MockCoreBTC");
    corebtc = await MockCoreBTC.deploy();
    await corebtc.waitForDeployment();

    const SwapForNUSD = await hre.ethers.getContractFactory("SwapForNUSD");
    swap = await SwapForNUSD.deploy(corebtc.target, "0x0000000000000000000000000000000000000000");
    await swap.waitForDeployment();

    const NUSD = await hre.ethers.getContractFactory("NUSD");
    nusd = await NUSD.deploy(swap.target);
    await nusd.waitForDeployment();

    await corebtc.transfer(user.address, 10 * 10**8);
  });

  it("should swap CoreBTC for nUSD", async function () {
    const amount = 1 * 10**8; // 1 CoreBTC
    await corebtc.connect(user).approve(swap.target, amount);
    await swap.connect(user).swapToNUSD(amount);
    expect(await nusd.balanceOf(user.address)).to.equal(70000 * 10**6); // 70,000 nUSD
  });
});