// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy NUSD token
  const NUSD = await hre.ethers.getContractFactory("NUSD");
  const nusd = await NUSD.deploy();
  await nusd.deployed();
  console.log("NUSD token deployed to:", nusd.address);

  // Deploy SwapForNUSD
  const SwapForNUSD = await hre.ethers.getContractFactory("SwapForNUSD");
  const swapForNUSD = await SwapForNUSD.deploy(nusd.address);
  await swapForNUSD.deployed();
  console.log("SwapForNUSD deployed to:", swapForNUSD.address);

  // Grant minter role to SwapForNUSD contract
  const MINTER_ROLE = await nusd.MINTER_ROLE();
  await nusd.grantRole(MINTER_ROLE, swapForNUSD.address);
  console.log("Granted minter role to SwapForNUSD");

  // FOR TESTNET ONLY: Deploy mock tokens
  // In production, you would use the actual token addresses
  console.log("Deploying mock tokens for testing...");

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.deployed();
  console.log("MockUSDT deployed to:", mockUSDT.address);

  const MockWETH = await hre.ethers.getContractFactory("MockWETH");
  const mockWETH = await MockWETH.deploy();
  await mockWETH.deployed();
  console.log("MockWETH deployed to:", mockWETH.address);

  const MockWBTC = await hre.ethers.getContractFactory("MockWBTC");
  const mockWBTC = await MockWBTC.deploy();
  await mockWBTC.deployed();
  console.log("MockWBTC deployed to:", mockWBTC.address);

  // Set up initial configuration for supported collaterals
  console.log("Setting up collateral tokens...");

  // Add USDC as collateral (1 USDC = $1)
  // Price is in USD with 8 decimals precision, so $1 = 100000000
  await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
  console.log("Added USDC as collateral");

  // Add USDT as collateral (1 USDT = $1)
  await swapForNUSD.addCollateral(mockUSDT.address, 100000000, 6);
  console.log("Added USDT as collateral");

  // Add WETH as collateral (use current ETH price, e.g., $3000)
  // $3000 with 8 decimals precision = 300000000000
  await swapForNUSD.addCollateral(mockWETH.address, 300000000000, 18);
  console.log("Added WETH as collateral");

  // Add WBTC as collateral (use current BTC price, e.g., $60000)
  // $60000 with 8 decimals precision = 6000000000000
  await swapForNUSD.addCollateral(mockWBTC.address, 6000000000000, 8);
  console.log("Added WBTC as collateral");

  console.log("Deployment complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });