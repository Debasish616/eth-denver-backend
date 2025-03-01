// Test script to verify deployed contracts
const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting contract test script...");
    
    // Read contract artifacts
    console.log("Reading contract artifacts...");
    const nusdArtifact = require('../artifacts/contracts/NUSD.sol/NUSD.json');
    const swapArtifact = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json');
    const mockTokenArtifact = require('../artifacts/contracts/MockToken.sol/MockToken.json');
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, "../deployments/sepolia.json");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Loaded deployment info:", deploymentInfo);
    
    // Connect to the network
    console.log("Connecting to Sepolia network...");
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Create a wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using wallet address:", wallet.address);
    
    // Verify wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    // Test each contract
    console.log("\n===== Testing NUSD Token =====");
    const nusdAddress = deploymentInfo.nusd;
    console.log("NUSD address:", nusdAddress);
    
    // Check if contract exists at address
    const nusdCode = await provider.getCode(nusdAddress);
    console.log("Contract code exists:", nusdCode !== "0x");
    
    if (nusdCode === "0x") {
      console.error("No contract deployed at NUSD address!");
    } else {
      // Connect to NUSD contract
      const nusd = new ethers.Contract(nusdAddress, nusdArtifact.abi, wallet);
      
      // Test some basic functions
      try {
        const name = await nusd.name();
        console.log("Token name:", name);
        
        const symbol = await nusd.symbol();
        console.log("Token symbol:", symbol);
        
        const decimals = await nusd.decimals();
        console.log("Token decimals:", decimals);
        
        const totalSupply = await nusd.totalSupply();
        console.log("Total supply:", ethers.formatUnits(totalSupply, decimals));
        
        const walletBalance = await nusd.balanceOf(wallet.address);
        console.log("Wallet balance:", ethers.formatUnits(walletBalance, decimals));
      } catch (error) {
        console.error("Error interacting with NUSD:", error);
      }
    }
    
    console.log("\n===== Testing Swap Contract =====");
    const swapAddress = deploymentInfo.swapForNUSD;
    console.log("Swap address:", swapAddress);
    
    // Check if contract exists at address
    const swapCode = await provider.getCode(swapAddress);
    console.log("Contract code exists:", swapCode !== "0x");
    
    if (swapCode === "0x") {
      console.error("No contract deployed at Swap address!");
    } else {
      // Connect to Swap contract
      const swap = new ethers.Contract(swapAddress, swapArtifact.abi, wallet);
      
      // Test some basic functions
      try {
        const nusdAddress = await swap.nusd();
        console.log("NUSD token from swap contract:", nusdAddress);
      } catch (error) {
        console.error("Error interacting with Swap contract:", error);
      }
    }
    
    // Test each mock token
    const tokenAddresses = deploymentInfo.tokens;
    
    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      console.log(`\n===== Testing ${symbol.toUpperCase()} Token =====`);
      console.log(`${symbol.toUpperCase()} address:`, address);
      
      // Check if contract exists at address
      const tokenCode = await provider.getCode(address);
      console.log("Contract code exists:", tokenCode !== "0x");
      
      if (tokenCode === "0x") {
        console.error(`No contract deployed at ${symbol.toUpperCase()} address!`);
      } else {
        // Connect to token contract
        const token = new ethers.Contract(address, mockTokenArtifact.abi, wallet);
        
        // Test some basic functions
        try {
          const name = await token.name();
          console.log("Token name:", name);
          
          const tokenSymbol = await token.symbol();
          console.log("Token symbol:", tokenSymbol);
          
          const decimals = await token.decimals();
          console.log("Token decimals:", decimals);
          
          const totalSupply = await token.totalSupply();
          console.log("Total supply:", ethers.formatUnits(totalSupply, decimals));
          
          const walletBalance = await token.balanceOf(wallet.address);
          console.log("Wallet balance:", ethers.formatUnits(walletBalance, decimals));
        } catch (error) {
          console.error(`Error interacting with ${symbol.toUpperCase()}:`, error);
        }
      }
    }
    
    console.log("\nContract testing complete!");
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