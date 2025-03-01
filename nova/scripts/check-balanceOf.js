const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting balanceOf test...");
    
    // Connect to the network
    console.log("Connecting to Sepolia network...");
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Create a wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using wallet address:", wallet.address);
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, "../deployments/sepolia.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Loaded deployment info");
    
    // NUSD Contract
    const nusdAddress = deploymentInfo.nusd;
    console.log("NUSD address:", nusdAddress);
    
    // Get NUSD contract directly with minimal ABI
    const minimalAbi = [
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const nusd = new ethers.Contract(nusdAddress, minimalAbi, wallet);
    
    // Check decimals
    try {
      const decimals = await nusd.decimals();
      console.log("NUSD decimals:", decimals);
    } catch (error) {
      console.error("Error getting decimals:", error);
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
    
    // Try with one of the mock tokens
    const usdcAddress = deploymentInfo.tokens.usdc;
    console.log("\nUSDC address:", usdcAddress);
    
    const usdc = new ethers.Contract(usdcAddress, minimalAbi, wallet);
    
    try {
      const balance = await usdc.balanceOf(wallet.address);
      console.log("USDC balance:", balance.toString());
    } catch (error) {
      console.error("Error with USDC balanceOf:", error);
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