const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockCoreBTC = await hre.ethers.getContractFactory("MockCoreBTC");
  const corebtc = await MockCoreBTC.deploy();
  await corebtc.waitForDeployment();
  console.log("MockCoreBTC deployed to:", corebtc.target);

  const SwapForNUSD = await hre.ethers.getContractFactory("SwapForNUSD");
  const swap = await SwapForNUSD.deploy(corebtc.target, "0x0000000000000000000000000000000000000000");
  await swap.waitForDeployment();
  console.log("SwapForNUSD deployed to:", swap.target);

  const NUSD = await hre.ethers.getContractFactory("NUSD");
  const nusd = await NUSD.deploy(swap.target);
  await nusd.waitForDeployment();
  console.log("NUSD deployed to:", nusd.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;

});