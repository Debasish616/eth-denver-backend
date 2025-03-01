// Simulation script to demonstrate an Ethena-like USDC ↔ NUSD flow
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Ethena-like USDC ↔ NUSD System Simulation");
  console.log("=================================================\n");

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
  console.log("\n");

  // --- STEP 2: Configure USDC as the only collateral ---
  console.log("STEP 2: Configuring USDC as collateral...");
  
  // Add USDC as collateral (1 USDC = $1 exactly, like Ethena)
  // Price is in USD with 8 decimals precision
  await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
  console.log("Added USDC as collateral at price $1.00");
  console.log("\n");

  // --- STEP 3: Give the user some USDC ---
  console.log("STEP 3: Setting up user with USDC...");
  
  // Mint 1000 USDC to the user (realistic amount)
  const usdcAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDC (6 decimals)
  await mockUSDC.mint(user.address, usdcAmount);
  console.log(`Minted 1,000 USDC to user (${usdcAmount.toString()} atomic units)`);

  // Display user's initial balances
  let usdcBalance = await mockUSDC.balanceOf(user.address);
  let nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's initial balances:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  console.log("\n");

  // --- STEP 4: User approves the SwapForNUSD contract to spend their USDC ---
  console.log("STEP 4: User approves USDC for swapping...");
  
  await mockUSDC.connect(user).approve(swapForNUSD.address, usdcAmount);
  console.log("User approved USDC spending");
  console.log("\n");

  // --- STEP 5: User mints NUSD with USDC (USDC → NUSD) ---
  console.log("STEP 5: User mints NUSD using USDC (like Ethena USDe)...");
  
  // Use 500 USDC to mint NUSD
  const usdcToSwap = ethers.utils.parseUnits("500", 6); // 500 USDC
  await swapForNUSD.connect(user).swapToNUSD(mockUSDC.address, usdcToSwap);
  console.log(`User swapped 500 USDC for NUSD`);

  // Display updated balances after minting
  usdcBalance = await mockUSDC.balanceOf(user.address);
  nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's balances after minting NUSD:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  
  // Check contract's USDC balance
  const contractUsdcBalance = await mockUSDC.balanceOf(swapForNUSD.address);
  console.log(`\nSwapForNUSD contract now holds: ${ethers.utils.formatUnits(contractUsdcBalance, 6)} USDC as collateral`);
  
  console.log(`\nExplanation: User deposited 500 USDC and received exactly 500 NUSD at a 1:1 ratio`);
  console.log("\n");

  // --- STEP 6: User burns NUSD to get USDC back (NUSD → USDC) ---
  console.log("STEP 6: User burns NUSD to withdraw USDC...");
  
  // First, approve the SwapForNUSD contract to spend NUSD
  await nusd.connect(user).approve(swapForNUSD.address, nusdBalance);
  console.log("User approved NUSD spending");
  
  // Redeem 200 NUSD for USDC
  const nusdToRedeem = ethers.utils.parseEther("200"); // 200 NUSD
  await swapForNUSD.connect(user).redeemFromNUSD(mockUSDC.address, nusdToRedeem);
  console.log("User redeemed 200 NUSD for USDC");

  // Display final balances after burning
  usdcBalance = await mockUSDC.balanceOf(user.address);
  nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's final balances after redeeming:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  
  // Check contract's USDC balance
  const finalContractUsdcBalance = await mockUSDC.balanceOf(swapForNUSD.address);
  console.log(`\nSwapForNUSD contract now holds: ${ethers.utils.formatUnits(finalContractUsdcBalance, 6)} USDC as collateral`);
  
  console.log(`\nExplanation: User burned 200 NUSD and received back exactly 200 USDC at a 1:1 ratio`);
  console.log("\n");

  console.log("Simulation complete!");
  console.log("=================================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 