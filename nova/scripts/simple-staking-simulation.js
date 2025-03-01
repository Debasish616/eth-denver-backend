// Simulation script to demonstrate NUSD staking for sNUSD
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Simple NUSD Staking Simulation");
  console.log("======================================\n");

  const [deployer, user] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("User address:", user.address);
  console.log("\n");

  // --- STEP 1: Deploy all required contracts ---
  console.log("STEP 1: Deploying contracts...");
  
  // Deploy NUSD token
  const NUSD = await ethers.getContractFactory("NUSD");
  const nusd = await NUSD.deploy();
  await nusd.deployed();
  console.log("NUSD token deployed to:", nusd.address);

  // Deploy SwapForNUSD
  const SwapForNUSD = await ethers.getContractFactory("SwapForNUSD");
  const swapForNUSD = await SwapForNUSD.deploy(nusd.address);
  await swapForNUSD.deployed();
  console.log("SwapForNUSD deployed to:", swapForNUSD.address);

  // Grant minter role to SwapForNUSD contract
  const MINTER_ROLE = await nusd.MINTER_ROLE();
  await nusd.grantRole(MINTER_ROLE, swapForNUSD.address);
  console.log("Granted minter role to SwapForNUSD");

  // Deploy mock USDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  // Deploy sNUSD (staked NUSD) token
  const SNUSD = await ethers.getContractFactory("NUSD"); // Reusing NUSD contract for simplicity
  const sNUSD = await SNUSD.deploy();
  await sNUSD.deployed();
  console.log("sNUSD token deployed to:", sNUSD.address);

  // Deploy SimpleStaking contract
  const SimpleStaking = await ethers.getContractFactory("SimpleStaking");
  const staking = await SimpleStaking.deploy(nusd.address, sNUSD.address);
  await staking.deployed();
  console.log("SimpleStaking deployed to:", staking.address);

  // Grant minter role for sNUSD to staking contract
  await sNUSD.grantRole(MINTER_ROLE, staking.address);
  console.log("Granted minter role for sNUSD to staking contract");
  
  // Give sNUSD to staking contract to distribute
  await sNUSD.mint(staking.address, ethers.utils.parseEther("1000000"));
  console.log("Minted 1,000,000 sNUSD to staking contract");
  console.log("\n");

  // --- STEP 2: Get NUSD tokens for user ---
  console.log("STEP 2: Setting up user with NUSD tokens...");
  
  // Add USDC as collateral
  await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
  console.log("Added USDC as collateral at price $1.00");
  
  // Mint 1000 USDC to the user
  const usdcAmount = ethers.utils.parseUnits("1000", 6);
  await mockUSDC.mint(user.address, usdcAmount);
  console.log("Minted 1,000 USDC to user");
  
  // User approves and swaps USDC for NUSD
  await mockUSDC.connect(user).approve(swapForNUSD.address, usdcAmount);
  await swapForNUSD.connect(user).swapToNUSD(mockUSDC.address, ethers.utils.parseUnits("500", 6));
  console.log("User swapped 500 USDC for 500 NUSD");
  
  // Display user's NUSD balance
  const nusdBalance = await nusd.balanceOf(user.address);
  console.log(`User now has: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  console.log("\n");

  // --- STEP 3: User stakes NUSD for sNUSD ---
  console.log("STEP 3: User stakes NUSD to get sNUSD...");
  
  // User approves staking contract to spend their NUSD
  await nusd.connect(user).approve(staking.address, ethers.utils.parseEther("300"));
  console.log("User approved staking contract to spend 300 NUSD");
  
  // User stakes 300 NUSD
  await staking.connect(user).stake(ethers.utils.parseEther("300"));
  console.log("User staked 300 NUSD and received 300 sNUSD");
  
  // Display user's balances
  const nusdAfterStaking = await nusd.balanceOf(user.address);
  const sNusdBalance = await sNUSD.balanceOf(user.address);
  
  console.log("\nUser's balances after staking:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdAfterStaking, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdBalance, 18)} sNUSD`);
  console.log("\n");

  // --- STEP 4: User initiates unstaking ---
  console.log("STEP 4: User initiates unstaking (7-day lock period)...");
  
  // User approves staking contract to spend their sNUSD
  await sNUSD.connect(user).approve(staking.address, ethers.utils.parseEther("100"));
  console.log("User approved staking contract to spend 100 sNUSD");
  
  // User initiates unstaking of 100 sNUSD
  await staking.connect(user).initiateUnstake(ethers.utils.parseEther("100"));
  console.log("User initiated unstaking of 100 sNUSD");
  
  // Display user's request
  const requestCount = await staking.getUnstakeRequestCount(user.address);
  console.log(`User has ${requestCount} unstake request(s)`);
  
  const requestId = 0; // First request
  const request = await staking.getUnstakeRequest(user.address, requestId);
  
  console.log("\nUnstaking request details:");
  console.log(`Amount: ${ethers.utils.formatEther(request[0])} sNUSD`);
  console.log(`Unlock time: ${new Date(request[1].toNumber() * 1000).toLocaleString()}`);
  console.log(`Status: ${request[2] ? "Processed" : "Locked for 7 days"}`);
  console.log("\n");

  // --- STEP 5: Fast forward time to simulate 7-day lock period ---
  console.log("STEP 5: Fast-forwarding time to simulate 7-day lock period...");
  
  // Increase time by 7 days
  await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");
  
  console.log("Time fast-forwarded by 7 days");
  console.log("Lock period has ended, user can now complete unstaking");
  console.log("\n");

  // --- STEP 6: User completes unstaking after lock period ---
  console.log("STEP 6: User completes unstaking after lock period...");
  
  // Get balances before completing unstake
  const nusdBeforeUnstake = await nusd.balanceOf(user.address);
  const sNusdBeforeUnstake = await sNUSD.balanceOf(user.address);
  
  console.log("Balances before completing unstake:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBeforeUnstake, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdBeforeUnstake, 18)} sNUSD`);
  
  // User completes unstaking
  await staking.connect(user).completeUnstake(requestId);
  console.log("User completed unstaking of request #0");
  
  // Get balances after completing unstake
  const nusdAfterUnstake = await nusd.balanceOf(user.address);
  const sNusdAfterUnstake = await sNUSD.balanceOf(user.address);
  
  console.log("\nBalances after completing unstake:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdAfterUnstake, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdAfterUnstake, 18)} sNUSD`);
  console.log("\n");

  console.log("Simulation complete!");
  console.log("======================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 