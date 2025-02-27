const { ethers } = require("hardhat");
async function main() {
  const MockDAI = await ethers.getContractFactory("MockDAI"); // Or "TestToken" for the second run
  const token = await MockDAI.deploy();
  await token.deployed();
  console.log("MockDAI deployed to:", token.address); // Adjust message accordingly
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});