const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying NUSD with:", deployer.address);

  // Use deployer's address as a placeholder for swapContract
  const swapContractAddress = deployer.address;

  const NUSD = await hre.ethers.getContractFactory("NUSD");
  const nusd = await NUSD.deploy(swapContractAddress);
  await nusd.waitForDeployment();

  console.log("NUSD deployed to:", nusd.target);
  console.log("Swap contract set to:", await nusd.swapContract());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});