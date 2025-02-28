const hre = require("hardhat");

async function main() {
  const [user] = await hre.ethers.getSigners();
  const corebtcAddress = "0xYOUR_COREBTC_ADDRESS"; // Replace with deployed address
  const swapAddress = "0xYOUR_SWAP_ADDRESS";    // Replace with deployed address

  const CoreBTC = await hre.ethers.getContractAt("MockCoreBTC", corebtcAddress);
  const Swap = await hre.ethers.getContractAt("SwapForNUSD", swapAddress);

  const amount = 1 * 10**8; // 1 CoreBTC
  await CoreBTC.approve(swapAddress, amount);
  await Swap.swapToNUSD(amount);
  console.log("Swapped 1 CoreBTC for nUSD");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});