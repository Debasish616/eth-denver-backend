// Test script to check frontend contract interaction
const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Copy of the ABIs from frontend to test
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Basic ABI for NUSD token
const NUSD_ABI = [
  ...ERC20_ABI,
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

// Basic ABI for SwapForNUSD contract
const SWAP_FOR_NUSD_ABI = [
  "function swapToNUSD(address token, uint256 tokenAmount)",
  "function redeemFromNUSD(address token, uint256 nusdAmount)",
  "function calculateNUSDAmount(address token, uint256 tokenAmount) view returns (uint256)",
  "function calculateTokenAmount(address token, uint256 nusdAmount) view returns (uint256)",
  "function supportedCollaterals(address token) view returns (bool)",
  "function collateralPrices(address token) view returns (uint256)",
  "function collateralDecimals(address token) view returns (uint8)",
  "function deposits(address user, address token) view returns (uint256)",
  "function nusd() view returns (address)"
];

async function main() {
  try {
    console.log("Starting frontend ABI test...");
    
    // Connect to the network
    console.log("Connecting to Sepolia network...");
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Create a wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using wallet address:", wallet.address);
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, "../public/deployments/sepolia.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Loaded deployment info");
    
    // NUSD Contract
    const nusdAddress = deploymentInfo.nusd;
    console.log("NUSD address:", nusdAddress);
    
    // Get contract with frontend ABI
    console.log("\n===== Testing with frontend NUSD_ABI =====");
    const nusd = new ethers.Contract(nusdAddress, NUSD_ABI, wallet);
    
    // Check decimals
    try {
      const decimals = await nusd.decimals();
      console.log("NUSD decimals:", decimals);
    } catch (error) {
      console.error("Error getting decimals:", error);
      console.error("Error details:", error.toString());
    }
    
    // Check balanceOf
    try {
      const balance = await nusd.balanceOf(wallet.address);
      console.log("Raw balance:", balance.toString());
      
      // Try to get decimals again to format the balance
      try {
        const decimals = await nusd.decimals();
        console.log("Formatted balance:", ethers.formatUnits(balance, decimals));
      } catch (err) {
        console.log("Could not format using decimals, using default 18 decimals");
        console.log("Formatted balance (assuming 18 decimals):", ethers.formatUnits(balance, 18));
      }
    } catch (error) {
      console.error("Error with balanceOf:", error);
      console.error("Error details:", error.toString());
    }
    
    // Test swap contract
    console.log("\n===== Testing with frontend SWAP_FOR_NUSD_ABI =====");
    const swapAddress = deploymentInfo.swapForNUSD;
    console.log("Swap address:", swapAddress);
    
    const swap = new ethers.Contract(swapAddress, SWAP_FOR_NUSD_ABI, wallet);
    
    // Test nusd() function
    try {
      const nusdFromSwap = await swap.nusd();
      console.log("NUSD token from swap contract:", nusdFromSwap);
      console.log("Matches expected NUSD address:", nusdFromSwap === nusdAddress);
    } catch (error) {
      console.error("Error with swap.nusd():", error);
      console.error("Error details:", error.toString());
    }
    
    console.log("\nTest complete!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 