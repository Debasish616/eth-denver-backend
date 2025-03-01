const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting price configuration check...");
    
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
    
    // Get contract addresses
    const nusdAddress = deploymentInfo.nusd;
    const swapAddress = deploymentInfo.swapForNUSD;
    const usdcAddress = deploymentInfo.tokens.usdc;
    
    console.log("NUSD address:", nusdAddress);
    console.log("Swap address:", swapAddress);
    console.log("USDC address:", usdcAddress);
    
    // Load contract ABIs
    const nusdArtifact = require('../artifacts/contracts/NUSD.sol/NUSD.json');
    const swapArtifact = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json');
    const mockTokenArtifact = require('../artifacts/contracts/MockToken.sol/MockToken.json');
    
    // Create contract instances
    const nusd = new ethers.Contract(nusdAddress, nusdArtifact.abi, wallet);
    const swap = new ethers.Contract(swapAddress, swapArtifact.abi, wallet);
    const usdc = new ethers.Contract(usdcAddress, mockTokenArtifact.abi, wallet);
    
    // Get token decimals
    const usdcDecimals = await usdc.decimals();
    console.log("USDC decimals:", usdcDecimals);
    
    const nusdDecimals = await nusd.decimals();
    console.log("NUSD decimals:", nusdDecimals);
    
    // Check if USDC is supported
    const isSupported = await swap.supportedCollaterals(usdcAddress);
    console.log("Is USDC supported:", isSupported);
    
    // Check current price configuration
    const currentPrice = await swap.collateralPrices(usdcAddress);
    console.log("Current USDC price in contract:", currentPrice.toString());
    
    // Check current decimals configuration
    const currentDecimals = await swap.collateralDecimals(usdcAddress);
    console.log("Current USDC decimals in contract:", currentDecimals.toString());
    
    // Calculate expected price for 1:1 conversion
    // SwapForNUSD contract uses 10^8 scaling factor for prices
    const expectedPrice = ethers.parseUnits("1", 8); // 1.0 with 8 decimal places
    console.log("Expected price for 1:1 ratio:", expectedPrice.toString());
    
    // Check if price needs to be updated
    if (currentPrice.toString() !== expectedPrice.toString()) {
      console.log("Price needs to be updated to ensure 1 USDC = 1 NUSD");
      try {
        console.log("Updating price...");
        const tx = await swap.updatePrice(usdcAddress, expectedPrice);
        await tx.wait();
        console.log("Price updated successfully!");
        
        // Verify the new price
        const newPrice = await swap.collateralPrices(usdcAddress);
        console.log("New USDC price:", newPrice.toString());
      } catch (error) {
        console.error("Error updating price:", error.message);
      }
    } else {
      console.log("Price is already correctly set for 1:1 conversion");
    }
    
    // Check decimals match
    if (currentDecimals.toString() !== usdcDecimals.toString()) {
      console.log("Decimals configuration doesn't match actual token decimals");
      try {
        console.log("Updating decimals configuration...");
        // Need to update the collateral to fix the decimals
        const tx = await swap.addCollateral(usdcAddress, expectedPrice, usdcDecimals);
        await tx.wait();
        console.log("Decimals updated successfully!");
        
        // Verify the new decimals
        const newDecimals = await swap.collateralDecimals(usdcAddress);
        console.log("New USDC decimals in contract:", newDecimals.toString());
      } catch (error) {
        console.error("Error updating decimals:", error.message);
      }
    } else {
      console.log("Decimals configuration is correct");
    }
    
    // Now test calculation of NUSD amount for 1 USDC
    try {
      const testAmount = ethers.parseUnits("1", usdcDecimals); // 1 USDC
      const nusdAmount = await swap.calculateNUSDAmount(usdcAddress, testAmount);
      console.log(`1 USDC (${testAmount.toString()} wei) = ${ethers.formatUnits(nusdAmount, nusdDecimals)} NUSD`);
      
      if (ethers.formatUnits(nusdAmount, nusdDecimals) === "1.0") {
        console.log("✅ Price configuration is correct! 1 USDC = 1 NUSD");
      } else {
        console.log("❌ Price configuration is incorrect. Conversion rate is not 1:1");
      }
    } catch (error) {
      console.error("Error calculating NUSD amount:", error.message);
    }
    
    // Check minter role
    console.log("\nChecking minter role...");
    const MINTER_ROLE = await nusd.MINTER_ROLE();
    const hasMinterRole = await nusd.hasRole(MINTER_ROLE, swapAddress);
    console.log("Swap contract has minter role:", hasMinterRole);
    
    if (!hasMinterRole) {
      console.log("The swap contract doesn't have minter role for NUSD, which is required");
      try {
        console.log("Granting minter role to swap contract...");
        const tx = await nusd.grantRole(MINTER_ROLE, swapAddress);
        await tx.wait();
        console.log("Minter role granted to swap contract!");
      } catch (error) {
        console.error("Error granting minter role:", error.message);
      }
    }
    
    console.log("\nConfiguration check completed!");
  } catch (error) {
    console.error("Script failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 