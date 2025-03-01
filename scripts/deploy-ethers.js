// Simple deployment script using ethers.js directly
const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Load contract ABIs and bytecode
const NUSD_ABI = require('../artifacts/contracts/NUSD.sol/NUSD.json').abi;
const NUSD_BYTECODE = require('../artifacts/contracts/NUSD.sol/NUSD.json').bytecode;

const SWAP_ABI = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json').abi;
const SWAP_BYTECODE = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json').bytecode;

const MOCK_TOKEN_ABI = require('../artifacts/contracts/MockToken.sol/MockToken.json').abi;
const MOCK_TOKEN_BYTECODE = require('../artifacts/contracts/MockToken.sol/MockToken.json').bytecode;

async function main() {
  try {
    // Connect to the Sepolia network
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Create a wallet from private key
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("Deploying contracts with the account:", wallet.address);
    console.log("Account balance:", ethers.utils.formatEther(await wallet.getBalance()));
    
    // Deploy NUSD token
    console.log("Deploying NUSD token...");
    const nusdFactory = new ethers.ContractFactory(NUSD_ABI, NUSD_BYTECODE, wallet);
    const nusd = await nusdFactory.deploy();
    await nusd.deployed();
    console.log("NUSD token deployed to:", nusd.address);
    
    // Deploy SwapForNUSD
    console.log("Deploying SwapForNUSD...");
    const swapFactory = new ethers.ContractFactory(SWAP_ABI, SWAP_BYTECODE, wallet);
    const swap = await swapFactory.deploy(nusd.address);
    await swap.deployed();
    console.log("SwapForNUSD deployed to:", swap.address);
    
    // Grant minter role to SwapForNUSD contract
    console.log("Granting minter role to SwapForNUSD...");
    const MINTER_ROLE = await nusd.MINTER_ROLE();
    await nusd.grantRole(MINTER_ROLE, swap.address);
    console.log("Granted minter role to SwapForNUSD");
    
    // Deploy mock tokens
    console.log("Deploying mock tokens for testing...");
    
    // Deploy MockUSDC
    const mockUSDCFactory = new ethers.ContractFactory(MOCK_TOKEN_ABI, MOCK_TOKEN_BYTECODE, wallet);
    const mockUSDC = await mockUSDCFactory.deploy("USD Coin", "USDC", 6);
    await mockUSDC.deployed();
    console.log("MockUSDC deployed to:", mockUSDC.address);
    
    // Deploy MockUSDT
    const mockUSDTFactory = new ethers.ContractFactory(MOCK_TOKEN_ABI, MOCK_TOKEN_BYTECODE, wallet);
    const mockUSDT = await mockUSDTFactory.deploy("Tether USD", "USDT", 6);
    await mockUSDT.deployed();
    console.log("MockUSDT deployed to:", mockUSDT.address);
    
    // Deploy MockWETH
    const mockWETHFactory = new ethers.ContractFactory(MOCK_TOKEN_ABI, MOCK_TOKEN_BYTECODE, wallet);
    const mockWETH = await mockWETHFactory.deploy("Wrapped Ethereum", "WETH", 18);
    await mockWETH.deployed();
    console.log("MockWETH deployed to:", mockWETH.address);
    
    // Deploy MockWBTC
    const mockWBTCFactory = new ethers.ContractFactory(MOCK_TOKEN_ABI, MOCK_TOKEN_BYTECODE, wallet);
    const mockWBTC = await mockWBTCFactory.deploy("Wrapped Bitcoin", "WBTC", 8);
    await mockWBTC.deployed();
    console.log("MockWBTC deployed to:", mockWBTC.address);
    
    // Set up initial configuration for supported collaterals
    console.log("Setting up collateral tokens...");
    
    // Add USDC as collateral (1 USDC = $1)
    // Price is in USD with 8 decimals precision, so $1 = 100000000
    await swap.addCollateral(mockUSDC.address, 100000000, 6);
    console.log("Added USDC as collateral");
    
    // Add USDT as collateral (1 USDT = $1)
    await swap.addCollateral(mockUSDT.address, 100000000, 6);
    console.log("Added USDT as collateral");
    
    // Add WETH as collateral (use current ETH price, e.g., $3000)
    // $3000 with 8 decimals precision = 300000000000
    await swap.addCollateral(mockWETH.address, 300000000000, 18);
    console.log("Added WETH as collateral");
    
    // Add WBTC as collateral (use current BTC price, e.g., $60000)
    // $60000 with 8 decimals precision = 6000000000000
    await swap.addCollateral(mockWBTC.address, 6000000000000, 8);
    console.log("Added WBTC as collateral");
    
    // Save deployment info
    const deploymentInfo = {
      deployer: wallet.address,
      nusd: nusd.address,
      swapForNUSD: swap.address,
      tokens: {
        usdc: mockUSDC.address,
        usdt: mockUSDT.address,
        weth: mockWETH.address,
        wbtc: mockWBTC.address
      },
      network: "sepolia",
      timestamp: new Date().toISOString()
    };
    
    console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
    
    // Create deployments directory if it doesn't exist
    const deploymentFolder = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentFolder)) {
      fs.mkdirSync(deploymentFolder, { recursive: true });
    }
    
    // Write deployment info to file
    const deploymentFile = path.join(deploymentFolder, "sepolia.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to ${deploymentFile}`);
    
    // Try to save to frontend directory if it exists
    try {
      const frontendDir = path.join(__dirname, "../../eth-denver-frontend/public");
      if (fs.existsSync(frontendDir)) {
        const frontendDeploymentDir = path.join(frontendDir, "deployments");
        if (!fs.existsSync(frontendDeploymentDir)) {
          fs.mkdirSync(frontendDeploymentDir, { recursive: true });
        }
        const frontendDeploymentFile = path.join(frontendDeploymentDir, "sepolia.json");
        fs.writeFileSync(frontendDeploymentFile, JSON.stringify(deploymentInfo, null, 2));
        console.log(`Deployment info also saved to frontend at ${frontendDeploymentFile}`);
      }
    } catch (error) {
      console.warn("Could not save to frontend directory:", error.message);
    }
    
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Error in deployment:", error);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 