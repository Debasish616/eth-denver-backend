// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

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

  // Deploy mock tokens
  console.log("Deploying mock tokens for testing...");

  // Deploy MockUSDC
  const MockUSDC = await hre.ethers.getContractFactory("MockToken");
  const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
  await mockUSDC.deployed();
  console.log("MockUSDC deployed to:", mockUSDC.address);

  // Deploy MockUSDT
  const MockUSDT = await hre.ethers.getContractFactory("MockToken");
  const mockUSDT = await MockUSDT.deploy("Tether USD", "USDT", 6);
  await mockUSDT.deployed();
  console.log("MockUSDT deployed to:", mockUSDT.address);

  // Deploy MockWETH
  const MockWETH = await hre.ethers.getContractFactory("MockToken");
  const mockWETH = await MockWETH.deploy("Wrapped Ethereum", "WETH", 18);
  await mockWETH.deployed();
  console.log("MockWETH deployed to:", mockWETH.address);

  // Deploy MockWBTC
  const MockWBTC = await hre.ethers.getContractFactory("MockToken");
  const mockWBTC = await MockWBTC.deploy("Wrapped Bitcoin", "WBTC", 8);
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

  // Save deployed contract addresses to a file that our frontend can use
  const deploymentInfo = {
    deployer: deployer.address,
    nusd: nusd.address,
    swapForNUSD: swapForNUSD.address,
    tokens: {
      usdc: mockUSDC.address,
      usdt: mockUSDT.address,
      weth: mockWETH.address,
      wbtc: mockWBTC.address
    },
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  // Save to file in both the contract project and frontend
  const deploymentFolder = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentFolder)) {
    fs.mkdirSync(deploymentFolder, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentFolder, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deploymentFile}`);

  // Try to save to frontend directory if it exists
  try {
    const frontendDir = path.join(__dirname, "../../../eth-denver-frontend/public");
    if (fs.existsSync(frontendDir)) {
      const frontendDeploymentDir = path.join(frontendDir, "deployments");
      if (!fs.existsSync(frontendDeploymentDir)) {
        fs.mkdirSync(frontendDeploymentDir, { recursive: true });
      }
      const frontendDeploymentFile = path.join(frontendDeploymentDir, `${hre.network.name}.json`);
      fs.writeFileSync(frontendDeploymentFile, JSON.stringify(deploymentInfo, null, 2));
      console.log(`Deployment info also saved to frontend at ${frontendDeploymentFile}`);
    }
  } catch (error) {
    console.warn("Could not save to frontend directory:", error.message);
  }

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