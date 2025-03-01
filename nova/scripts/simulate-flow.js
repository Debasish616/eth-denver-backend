// Simulation script to demonstrate the full user flow of the NUSD system
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting NUSD system simulation...");
  console.log("===============================\n");

  const [deployer, user] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Test user address:", user.address);
  console.log("\n");

  // --- STEP 1: Deploy all contracts ---
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

  // Deploy mock tokens: USDC and WBTC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  const MockWBTC = await ethers.getContractFactory("MockWBTC");
  const mockWBTC = await MockWBTC.deploy();
  await mockWBTC.deployed();
  console.log("MockWBTC deployed to:", mockWBTC.address);
  console.log("\n");

  // --- STEP 2: Configure collateral tokens ---
  console.log("STEP 2: Configuring collateral tokens...");
  
  // Add USDC as collateral (1 USDC = $1)
  // Price is in USD with 8 decimals precision
  await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
  console.log("Added USDC as collateral at price $1.00");

  // Add WBTC as collateral (current price ~$60,000)
  // $60,000 with 8 decimals precision
  await swapForNUSD.addCollateral(mockWBTC.address, 6000000000000, 8);
  console.log("Added WBTC as collateral at price $60,000.00");
  console.log("\n");

  // --- STEP 3: Give the user some tokens to play with ---
  console.log("STEP 3: Setting up test user with tokens...");
  
  // Mint 10 USDC to the user
  const usdcAmount = ethers.utils.parseUnits("10", 6); // 10 USDC (6 decimals)
  await mockUSDC.mint(user.address, usdcAmount);
  console.log(`Minted 10 USDC to user (${usdcAmount.toString()} atomic units)`);
  
  // Mint 10 WBTC to the user
  const wbtcAmount = ethers.utils.parseUnits("10", 8); // 10 WBTC (8 decimals)
  await mockWBTC.mint(user.address, wbtcAmount);
  console.log(`Minted 10 WBTC to user (${wbtcAmount.toString()} atomic units)`);

  // Display user's initial balances
  let usdcBalance = await mockUSDC.balanceOf(user.address);
  let wbtcBalance = await mockWBTC.balanceOf(user.address);
  let nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's initial balances:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`WBTC: ${ethers.utils.formatUnits(wbtcBalance, 8)} WBTC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  console.log("\n");

  // --- STEP 4: User approves the SwapForNUSD contract to spend their tokens ---
  console.log("STEP 4: User approves tokens for swapping...");
  
  await mockUSDC.connect(user).approve(swapForNUSD.address, usdcAmount);
  console.log("User approved USDC spending");
  
  await mockWBTC.connect(user).approve(swapForNUSD.address, wbtcAmount);
  console.log("User approved WBTC spending");
  console.log("\n");

  // --- STEP 5: User mints NUSD with some of their tokens ---
  console.log("STEP 5: User mints NUSD using their tokens...");
  
  // Use 5 USDC to mint NUSD
  const usdcToSwap = ethers.utils.parseUnits("5", 6); // 5 USDC
  await swapForNUSD.connect(user).swapToNUSD(mockUSDC.address, usdcToSwap);
  console.log(`User swapped 5 USDC for NUSD`);
  
  // Use 0.1 WBTC to mint NUSD
  const wbtcToSwap = ethers.utils.parseUnits("0.1", 8); // 0.1 WBTC
  await swapForNUSD.connect(user).swapToNUSD(mockWBTC.address, wbtcToSwap);
  console.log(`User swapped 0.1 WBTC for NUSD`);

  // Display updated balances after minting
  usdcBalance = await mockUSDC.balanceOf(user.address);
  wbtcBalance = await mockWBTC.balanceOf(user.address);
  nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's balances after minting NUSD:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`WBTC: ${ethers.utils.formatUnits(wbtcBalance, 8)} WBTC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  
  // Calculate expected NUSD amount from 5 USDC and 0.1 WBTC
  // 5 USDC = $5 worth of NUSD
  // 0.1 WBTC = $6,000 worth of NUSD
  // Total = $6,005 worth of NUSD
  console.log(`\nExplanation: User received 5 NUSD from USDC and 6,000 NUSD from WBTC, totaling 6,005 NUSD`);
  console.log("\n");

  // --- STEP 6: User burns some NUSD to get their original tokens back ---
  console.log("STEP 6: User burns NUSD to retrieve original tokens...");
  
  // First, approve the SwapForNUSD contract to spend NUSD
  await nusd.connect(user).approve(swapForNUSD.address, nusdBalance);
  console.log("User approved NUSD spending");
  
  // Redeem 3 NUSD for USDC
  const nusdToRedeemForUsdc = ethers.utils.parseEther("3"); // 3 NUSD
  await swapForNUSD.connect(user).redeemFromNUSD(mockUSDC.address, nusdToRedeemForUsdc);
  console.log("User redeemed 3 NUSD for USDC");
  
  // Redeem 3000 NUSD for WBTC
  const nusdToRedeemForWbtc = ethers.utils.parseEther("3000"); // 3000 NUSD
  await swapForNUSD.connect(user).redeemFromNUSD(mockWBTC.address, nusdToRedeemForWbtc);
  console.log("User redeemed 3000 NUSD for WBTC");

  // Display final balances after burning
  usdcBalance = await mockUSDC.balanceOf(user.address);
  wbtcBalance = await mockWBTC.balanceOf(user.address);
  nusdBalance = await nusd.balanceOf(user.address);
  
  console.log("\nUser's final balances after redeeming:");
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`WBTC: ${ethers.utils.formatUnits(wbtcBalance, 8)} WBTC`);
  console.log(`NUSD: ${ethers.utils.formatUnits(nusdBalance, 18)} NUSD`);
  console.log("\n");

  console.log("Simulation complete!");
  console.log("===============================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 