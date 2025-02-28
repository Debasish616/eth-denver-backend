const { expect } = require("chai");
const hre = require("hardhat");

describe("NUSD", function () {
  let nusd, swap, owner, user;

  beforeEach(async function () {
    [owner, user] = await hre.ethers.getSigners();
    const SwapForNUSD = await hre.ethers.getContractFactory("SwapForNUSD");
    swap = await SwapForNUSD.deploy("0x1", "0x0000000000000000000000000000000000000000");
    await swap.waitForDeployment();

    const NUSD = await hre.ethers.getContractFactory("NUSD");
    nusd = await NUSD.deploy(swap.target);
    await nusd.waitForDeployment();
  });

  it("should restrict minting to swap contract", async function () {
    await expect(nusd.connect(user).mint(user.address, 100))
      .to.be.revertedWith("Only swap contract can call");
  });
});