const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// This is a simplified version of the frontend's ABI for testing
const SWAP_FOR_NUSD_ABI = [
  "function swapToNUSD(address token, uint256 tokenAmount)",
  "function calculateNUSDAmount(address token, uint256 tokenAmount) view returns (uint256)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  try {
    console.log("Starting frontend integration test...");
    
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
    
    // Create contracts using simplified ABIs (like in the frontend)
    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, wallet);
    const swap = new ethers.Contract(swapAddress, SWAP_FOR_NUSD_ABI, wallet);
    
    // Get token decimals
    const usdcDecimals = await usdc.decimals();
    console.log("\nUSDC decimals:", usdcDecimals);
    
    // Check token balances
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log("USDC balance:", ethers.formatUnits(usdcBalance, usdcDecimals));
    
    // Define the amount to swap (1 USDC)
    const swapAmount = ethers.parseUnits("1", usdcDecimals);
    console.log(`\nAttempting to swap ${ethers.formatUnits(swapAmount, usdcDecimals)} USDC to NUSD`);
    
    // Check allowance
    const allowance = await usdc.allowance(wallet.address, swapAddress);
    console.log("USDC allowance for swap:", ethers.formatUnits(allowance, usdcDecimals));
    
    // Try to calculate expected NUSD amount
    console.log("\nCalculating expected NUSD amount...");
    try {
      const expectedNusdAmount = await swap.calculateNUSDAmount(usdcAddress, swapAmount);
      console.log(`Expected NUSD amount: ${ethers.formatUnits(expectedNusdAmount, 18)}`);
    } catch (error) {
      console.error("Error calculating NUSD amount:", error.message);
    }
    
    // Try direct call to swapToNUSD
    console.log("\nTesting direct call to swapToNUSD...");
    try {
      // Try to estimate gas for the swap
      const estimatedGas = await swap.swapToNUSD.estimateGas(usdcAddress, swapAmount);
      console.log("Estimated gas:", estimatedGas.toString());
      
      // Execute the transaction with extra gas
      const gasLimit = Math.floor(Number(estimatedGas) * 1.5); // 50% extra gas
      console.log("Using gas limit:", gasLimit);
      
      // Could use this in a real transaction - just testing estimation now
      console.log("Gas estimation successful! The transaction should work in the frontend.");
    } catch (error) {
      console.error("Error estimating gas for swapToNUSD:", error.message);
      
      // Try to explain the issue
      console.log("\nPotential issues:");
      if (error.message.includes("cannot estimate gas")) {
        console.log("- The transaction is failing during gas estimation");
        console.log("- This could be due to contract state or parameter issues");
      }
      if (error.message.includes("missing revert data")) {
        console.log("- The contract is reverting silently without error data");
        console.log("- This might indicate a permission issue or logical constraint in the contract");
      }
      if (error.message.includes("function was not found")) {
        console.log("- The ABI might not match the deployed contract");
        console.log("- The function signature might be different in the actual contract");
      }
    }
    
    // Try with low-level call
    console.log("\nTesting low-level call (should work based on previous test):");
    try {
      const encodedData = swap.interface.encodeFunctionData(
        'swapToNUSD', 
        [usdcAddress, swapAmount]
      );
      console.log("Encoded function call:", encodedData);
      
      // Estimate gas
      const gasEstimate = await provider.estimateGas({
        from: wallet.address,
        to: swapAddress,
        data: encodedData,
      });
      console.log("Estimated gas with low-level call:", gasEstimate.toString());
      console.log("Low-level method works! This approach could be used in the frontend.");
    } catch (error) {
      console.error("Error with low-level call:", error.message);
    }
    
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