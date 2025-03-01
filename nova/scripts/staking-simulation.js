// Simulation script to demonstrate NUSD staking mechanism
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting NUSD Staking System Simulation");
  console.log("=======================================\n");

  const [deployer, user] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("User address:", user.address);
  console.log("\n");

  // --- STEP 1: Deploy base contracts ---
  console.log("STEP 1: Deploying base contracts...");
  
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

  // Deploy sNUSD token (Staked NUSD) with mock implementation
  const MockSNUSD = await ethers.getContractFactory("MockToken");
  const sNUSD = await MockSNUSD.deploy("Staked NUSD", "sNUSD", 18);
  await sNUSD.deployed();
  console.log("sNUSD token deployed to:", sNUSD.address);
  console.log("\n");

  // --- STEP 2: Deploy staking contract ---
  console.log("STEP 2: Deploying staking contract...");
  
  // Deploy NUSDStaking contract
  const NUSDStaking = await ethers.getContractFactory("NUSDStaking");
  const staking = await NUSDStaking.deploy(nusd.address, sNUSD.address);
  await staking.deployed();
  console.log("NUSDStaking contract deployed to:", staking.address);
  
  // Grant minter role for sNUSD to staking contract
  const sNUSD_MINTER_ROLE = await sNUSD.MINTER_ROLE();
  await sNUSD.grantRole(sNUSD_MINTER_ROLE, staking.address);
  console.log("Granted minter role for sNUSD to staking contract");
  console.log("\n");

  // --- STEP 3: Configure USDC as collateral and get NUSD ---
  console.log("STEP 3: Setting up USDC as collateral and obtaining NUSD...");

  // Add USDC as collateral
  await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
  console.log("Added USDC as collateral at price $1.00");
  
  // Mint 1000 USDC to the user
  const usdcAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDC
  await mockUSDC.mint(user.address, usdcAmount);
  console.log(`Minted 1,000 USDC to user`);
  
  // User approves USDC spending
  await mockUSDC.connect(user).approve(swapForNUSD.address, usdcAmount);
  
  // Use 500 USDC to mint NUSD
  const usdcToSwap = ethers.utils.parseUnits("500", 6); // 500 USDC
  await swapForNUSD.connect(user).swapToNUSD(mockUSDC.address, usdcToSwap);
  console.log("User swapped 500 USDC for 500 NUSD");
  
  // Display user's NUSD balance
  const nusdBalance = await nusd.balanceOf(user.address);
  console.log(`User now has: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  console.log("\n");

  // --- STEP 4: User stakes NUSD to get sNUSD ---
  console.log("STEP 4: User stakes NUSD to earn yield...");
  
  // User approves staking contract to spend NUSD
  await nusd.connect(user).approve(staking.address, nusdBalance);
  console.log("User approved NUSD spending for staking contract");
  
  // User stakes 300 NUSD
  const stakeAmount = ethers.utils.parseEther("300"); // 300 NUSD
  await staking.connect(user).stake(stakeAmount);
  console.log("User staked 300 NUSD");
  
  // Check user's balances
  const nusdAfterStake = await nusd.balanceOf(user.address);
  const sNusdBalance = await sNUSD.balanceOf(user.address);
  
  console.log("\nUser's balances after staking:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdAfterStake, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdBalance, 18)} sNUSD`);
  console.log("\n");

  // --- STEP 5: Fast forward time to simulate yield accrual ---
  console.log("STEP 5: Fast forward time to simulate yield accrual (30 days)...");
  
  // Fast forward 30 days (in seconds)
  await network.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
  await network.provider.send("evm_mine");
  
  // Get updated sNUSD balance (should be more due to rewards)
  const sNusdBalanceAfter30Days = await sNUSD.balanceOf(user.address);
  
  console.log("After 30 days:");
  console.log(`sNUSD balance: ${ethers.utils.formatUnits(sNusdBalanceAfter30Days, 18)} sNUSD`);
  
  // Calculate APY (simplified for simulation)
  const apy = ((Number(ethers.utils.formatUnits(sNusdBalanceAfter30Days, 18)) / 300) - 1) * 12 * 100;
  console.log(`Annualized yield (APY): ~${apy.toFixed(2)}%`);
  console.log("\n");

  // --- STEP 6: User requests to unstake ---
  console.log("STEP 6: User requests to unstake sNUSD...");
  
  // User initiates unstaking process
  await sNUSD.connect(user).approve(staking.address, sNusdBalanceAfter30Days);
  console.log("User approved sNUSD spending for staking contract");
  
  // User requests to unstake 100 sNUSD
  const unstakeAmount = ethers.utils.parseEther("100");
  await staking.connect(user).initiateUnstake(unstakeAmount);
  console.log("User initiated unstaking of 100 sNUSD");
  
  // Get unstaking requests
  const unstakeRequest = await staking.getUnstakeRequestForUser(user.address, 0);
  console.log("\nUnstaking request created:");
  console.log(`Amount: ${ethers.utils.formatEther(unstakeRequest.amount)} sNUSD`);
  console.log(`Request timestamp: ${new Date(unstakeRequest.timestamp.toNumber() * 1000).toLocaleString()}`);
  console.log(`Unlock time: ${new Date((unstakeRequest.timestamp.toNumber() + (7 * 24 * 60 * 60)) * 1000).toLocaleString()}`);
  console.log(`Status: Locked for 7 days`);
  console.log("\n");

  // --- STEP 7: Fast forward time to simulate 7-day locking period ---
  console.log("STEP 7: Fast forward time to simulate 7-day locking period...");
  
  // Fast forward 7 days (in seconds)
  await network.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
  await network.provider.send("evm_mine");
  
  console.log("7 days have passed. User can now complete the unstaking process.");
  console.log("\n");

  // --- STEP 8: User completes unstaking after lock period ---
  console.log("STEP 8: User completes unstaking process...");
  
  // Get user balances before finalizing unstake
  const nusdBeforeUnstake = await nusd.balanceOf(user.address);
  const sNusdBeforeUnstake = await sNUSD.balanceOf(user.address);
  
  console.log("Balances before completing unstake:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBeforeUnstake, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdBeforeUnstake, 18)} sNUSD`);
  
  // User completes unstaking
  await staking.connect(user).completeUnstake(0); // Unstake request ID 0
  console.log("User completed unstaking of request #0");
  
  // Get user balances after finalizing unstake
  const nusdAfterUnstake = await nusd.balanceOf(user.address);
  const sNusdAfterUnstake = await sNUSD.balanceOf(user.address);
  
  console.log("\nBalances after completing unstake:");
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdAfterUnstake, 18)} NUSD`);
  console.log(`sNUSD: ${ethers.utils.formatUnits(sNusdAfterUnstake, 18)} sNUSD`);
  console.log("\n");

  console.log("Simulation complete!");
  console.log("=======================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 