// Simplified simulation for NUSD staking with sNUSD and 7-day locking period
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting NUSD Staking Demonstration");
  console.log("==================================\n");

  const [deployer, user] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("User address:", user.address);
  console.log("\n");

  // --- STEP 1: Deploy contracts ---
  console.log("STEP 1: Deploying contracts...");
  
  // Deploy NUSD token
  const NUSD = await ethers.getContractFactory("NUSD");
  const nusd = await NUSD.deploy();
  await nusd.deployed();
  console.log("NUSD token deployed to:", nusd.address);

  // Deploy sNUSD token (also using NUSD contract for simplicity)
  const sNUSD = await NUSD.deploy();
  await sNUSD.deployed();
  console.log("sNUSD token deployed to:", sNUSD.address);

  // Deploy the staking contract
  const SNUSDStaking = await ethers.getContractFactory("SNUSDStaking");
  const staking = await SNUSDStaking.deploy(nusd.address, sNUSD.address);
  await staking.deployed();
  console.log("SNUSDStaking deployed to:", staking.address);
  
  // --- STEP 2: Setup tokens ---
  console.log("\nSTEP 2: Setting up tokens...");
  
  // Mint 1,000 NUSD to the user
  await nusd.mint(user.address, ethers.utils.parseEther("1000"));
  console.log("Minted 1,000 NUSD to user");
  
  // Mint 1,000,000 sNUSD to the staking contract (for distribution)
  await sNUSD.mint(staking.address, ethers.utils.parseEther("1000000"));
  console.log("Minted 1,000,000 sNUSD to staking contract");
  
  // Show user's initial balance
  const initialNusdBalance = await nusd.balanceOf(user.address);
  console.log(`User's initial NUSD balance: ${ethers.utils.formatEther(initialNusdBalance)} NUSD`);
  console.log("\n");
  
  // --- STEP 3: User stakes NUSD ---
  console.log("STEP 3: User stakes NUSD to get sNUSD...");
  
  // User approves contract to spend NUSD
  await nusd.connect(user).approve(staking.address, ethers.utils.parseEther("500"));
  console.log("User approved staking contract to spend 500 NUSD");
  
  // User stakes 500 NUSD
  await staking.connect(user).stake(ethers.utils.parseEther("500"));
  console.log("User staked 500 NUSD");
  
  // Show balances after staking
  const nusdAfterStaking = await nusd.balanceOf(user.address);
  const sNusdAfterStaking = await sNUSD.balanceOf(user.address);
  
  console.log("\nBalances after staking:");
  console.log(`NUSD: ${ethers.utils.formatEther(nusdAfterStaking)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatEther(sNusdAfterStaking)} sNUSD`);
  console.log("\n");
  
  // --- STEP 4: User requests to unstake ---
  console.log("STEP 4: User initiates unstaking (7-day lock period)...");
  
  // User approves contract to spend sNUSD
  await sNUSD.connect(user).approve(staking.address, ethers.utils.parseEther("200"));
  console.log("User approved staking contract to spend 200 sNUSD");
  
  // User initiates unstaking
  await staking.connect(user).initiateUnstake(ethers.utils.parseEther("200"));
  console.log("User initiated unstaking of 200 sNUSD");
  
  // Get unstake request details
  const requestCount = await staking.getUnstakeRequestCount(user.address);
  console.log(`User has ${requestCount} unstake request(s)`);
  
  const request = await staking.getUnstakeRequest(user.address, 0);
  const unlockTime = new Date(request[1].toNumber() * 1000);
  
  console.log("\nUnstake request details:");
  console.log(`Amount: ${ethers.utils.formatEther(request[0])} sNUSD`);
  console.log(`Unlock time: ${unlockTime.toLocaleString()}`);
  console.log(`Status: ${request[2] ? "Completed" : "Locked (7-day waiting period)"}`);
  console.log("\n");
  
  // --- STEP 5: Fast forward time ---
  console.log("STEP 5: Fast-forwarding time to simulate 7-day lock period...");
  
  // Fast forward time by 7 days
  await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");
  
  console.log("Time advanced by 7 days");
  console.log("Lock period has ended, user can now complete unstaking");
  console.log("\n");
  
  // --- STEP 6: Complete unstaking ---
  console.log("STEP 6: User completes unstaking after lock period...");
  
  // Show balances before completing unstake
  const nusdBeforeCompletion = await nusd.balanceOf(user.address);
  const sNusdBeforeCompletion = await sNUSD.balanceOf(user.address);
  
  console.log("Balances before completing unstake:");
  console.log(`NUSD: ${ethers.utils.formatEther(nusdBeforeCompletion)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatEther(sNusdBeforeCompletion)} sNUSD`);
  
  // Complete unstaking
  await staking.connect(user).completeUnstake(0);
  console.log("User completed unstaking");
  
  // Show final balances
  const nusdAfterUnstaking = await nusd.balanceOf(user.address);
  const sNusdAfterUnstaking = await sNUSD.balanceOf(user.address);
  
  console.log("\nFinal balances after unstaking:");
  console.log(`NUSD: ${ethers.utils.formatEther(nusdAfterUnstaking)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatEther(sNusdAfterUnstaking)} sNUSD`);
  console.log("\n");
  
  console.log("Demonstration complete!");
  console.log("==================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 