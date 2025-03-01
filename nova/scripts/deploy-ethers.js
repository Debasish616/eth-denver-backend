const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  try {
    console.log("Starting deployment script...");
    
    // Read contract artifacts
    console.log("Reading contract artifacts...");
    const nusdArtifact = require('../artifacts/contracts/NUSD.sol/NUSD.json');
    const swapArtifact = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json');
    const mockTokenArtifact = require('../artifacts/contracts/MockToken.sol/MockToken.json');
    
    // Connect to the network
    console.log("Connecting to Sepolia network...");
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Create a wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Deploying contracts with account:", wallet.address);
    
    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    // Deploy NUSD token
    console.log("Deploying NUSD token...");
    const nusdFactory = new ethers.ContractFactory(
      nusdArtifact.abi,
      nusdArtifact.bytecode,
      wallet
    );
    const nusd = await nusdFactory.deploy();
    await nusd.waitForDeployment();
    const nusdAddress = await nusd.getAddress();
    console.log("NUSD token deployed to:", nusdAddress);
    
    // Deploy SwapForNUSD
    console.log("Deploying SwapForNUSD...");
    const swapFactory = new ethers.ContractFactory(
      swapArtifact.abi,
      swapArtifact.bytecode,
      wallet
    );
    const swap = await swapFactory.deploy(nusdAddress);
    await swap.waitForDeployment();
    const swapAddress = await swap.getAddress();
    console.log("SwapForNUSD deployed to:", swapAddress);
    
    // Grant minter role to SwapForNUSD contract
    console.log("Granting minter role to SwapForNUSD...");
    const MINTER_ROLE = await nusd.MINTER_ROLE();
    const grantTx = await nusd.grantRole(MINTER_ROLE, swapAddress);
    await grantTx.wait();
    console.log("Granted minter role to SwapForNUSD");
    
    // Deploy mock tokens
    console.log("Deploying mock tokens for testing...");
    
    // Deploy MockUSDC
    console.log("Deploying MockUSDC...");
    const mockUsdcFactory = new ethers.ContractFactory(
      mockTokenArtifact.abi,
      mockTokenArtifact.bytecode,
      wallet
    );
    const mockUsdc = await mockUsdcFactory.deploy("USD Coin", "USDC", 6);
    await mockUsdc.waitForDeployment();
    const mockUsdcAddress = await mockUsdc.getAddress();
    console.log("MockUSDC deployed to:", mockUsdcAddress);
    
    // Deploy MockUSDT
    console.log("Deploying MockUSDT...");
    const mockUsdtFactory = new ethers.ContractFactory(
      mockTokenArtifact.abi,
      mockTokenArtifact.bytecode,
      wallet
    );
    const mockUsdt = await mockUsdtFactory.deploy("Tether USD", "USDT", 6);
    await mockUsdt.waitForDeployment();
    const mockUsdtAddress = await mockUsdt.getAddress();
    console.log("MockUSDT deployed to:", mockUsdtAddress);
    
    // Deploy MockWETH
    console.log("Deploying MockWETH...");
    const mockWethFactory = new ethers.ContractFactory(
      mockTokenArtifact.abi,
      mockTokenArtifact.bytecode,
      wallet
    );
    const mockWeth = await mockWethFactory.deploy("Wrapped Ethereum", "WETH", 18);
    await mockWeth.waitForDeployment();
    const mockWethAddress = await mockWeth.getAddress();
    console.log("MockWETH deployed to:", mockWethAddress);
    
    // Deploy MockWBTC
    console.log("Deploying MockWBTC...");
    const mockWbtcFactory = new ethers.ContractFactory(
      mockTokenArtifact.abi,
      mockTokenArtifact.bytecode,
      wallet
    );
    const mockWbtc = await mockWbtcFactory.deploy("Wrapped Bitcoin", "WBTC", 8);
    await mockWbtc.waitForDeployment();
    const mockWbtcAddress = await mockWbtc.getAddress();
    console.log("MockWBTC deployed to:", mockWbtcAddress);
    
    // Set up initial configuration for supported collaterals
    console.log("Setting up collateral tokens...");
    
    // Add USDC as collateral (1 USDC = $1)
    // Price is in USD with 8 decimals precision, so $1 = 100000000
    console.log("Adding USDC as collateral...");
    const addUsdcTx = await swap.addCollateral(mockUsdcAddress, 100000000, 6);
    await addUsdcTx.wait();
    console.log("Added USDC as collateral");
    
    // Add USDT as collateral (1 USDT = $1)
    console.log("Adding USDT as collateral...");
    const addUsdtTx = await swap.addCollateral(mockUsdtAddress, 100000000, 6);
    await addUsdtTx.wait();
    console.log("Added USDT as collateral");
    
    // Add WETH as collateral (use current ETH price, e.g., $3000)
    // $3000 with 8 decimals precision = 300000000000
    console.log("Adding WETH as collateral...");
    const addWethTx = await swap.addCollateral(mockWethAddress, 300000000000, 18);
    await addWethTx.wait();
    console.log("Added WETH as collateral");
    
    // Add WBTC as collateral (use current BTC price, e.g., $60000)
    // $60000 with 8 decimals precision = 6000000000000
    console.log("Adding WBTC as collateral...");
    const addWbtcTx = await swap.addCollateral(mockWbtcAddress, 6000000000000, 8);
    await addWbtcTx.wait();
    console.log("Added WBTC as collateral");
    
    // Save deployed contract addresses to a file that our frontend can use
    const deploymentInfo = {
      deployer: wallet.address,
      nusd: nusdAddress,
      swapForNUSD: swapAddress,
      tokens: {
        usdc: mockUsdcAddress,
        usdt: mockUsdtAddress,
        weth: mockWethAddress,
        wbtc: mockWbtcAddress
      },
      network: "sepolia",
      timestamp: new Date().toISOString()
    };
    
    // Save to file in both the contract project and frontend
    const deploymentFolder = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentFolder)) {
      fs.mkdirSync(deploymentFolder, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentFolder, "sepolia.json");
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
        const frontendDeploymentFile = path.join(frontendDeploymentDir, "sepolia.json");
        fs.writeFileSync(frontendDeploymentFile, JSON.stringify(deploymentInfo, null, 2));
        console.log(`Deployment info also saved to frontend at ${frontendDeploymentFile}`);
      }
    } catch (error) {
      console.warn("Could not save to frontend directory:", error.message);
    }
    
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 