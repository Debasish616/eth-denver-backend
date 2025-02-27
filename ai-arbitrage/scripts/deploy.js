const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy DynamicFeeHook
  const Hook = await ethers.getContractFactory("DynamicFeeHook");
  const hook = await Hook.deploy("0xPoolManagerAddress"); // Update with Unichain PoolManager
  await hook.deployed();
  console.log("DynamicFeeHook deployed to:", hook.address);

  // Initialize a V4 pool (mock setup)
  const PoolManager = new ethers.Contract(
    "0xPoolManagerAddress",
    ["function initializePool(address token0, address token1, uint24 fee, address hook) external"],
    deployer
  );
  const tx = await PoolManager.initializePool(
    process.env.UNICHAIN_DAI,
    process.env.UNICHAIN_WETH,
    3000, // Base fee
    hook.address
  );
  await tx.wait();
  console.log("Pool initialized with hook");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});