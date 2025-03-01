const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting swap test...");
    
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
    const swapArtifact = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json');
    const mockTokenArtifact = require('../artifacts/contracts/MockToken.sol/MockToken.json');
    const nusdArtifact = require('../artifacts/contracts/NUSD.sol/NUSD.json');
    
    // Create contract instances
    const usdc = new ethers.Contract(usdcAddress, mockTokenArtifact.abi, wallet);
    const nusd = new ethers.Contract(nusdAddress, nusdArtifact.abi, wallet);
    const swap = new ethers.Contract(swapAddress, swapArtifact.abi, wallet);
    
    // Print out all functions from the contract ABI for debugging
    console.log("\nInspecting ABI for swap contract:");
    console.log("ABI has", swapArtifact.abi.length, "entries");
    
    swapArtifact.abi.forEach((entry, index) => {
      if (entry.type === 'function') {
        console.log(`- ${entry.name}(${entry.inputs.map(i => i.type).join(',')})`);
      }
    });
    
    // Look for specific functions
    console.log("\nChecking for swapToNUSD function:");
    const swapFunction = swapArtifact.abi.find(
      entry => entry.type === 'function' && entry.name === 'swapToNUSD'
    );
    
    if (swapFunction) {
      console.log("Found swapToNUSD function:");
      console.log("- Name:", swapFunction.name);
      console.log("- Inputs:", swapFunction.inputs.map(i => `${i.type} ${i.name}`).join(", "));
      console.log("- Stateful:", swapFunction.stateMutability);
    } else {
      console.log("⚠️ swapToNUSD function not found in ABI!");
    }
    
    // Get token decimals
    const usdcDecimals = await usdc.decimals();
    console.log("\nUSDC decimals:", usdcDecimals);
    
    // Check token balances
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log("USDC balance:", ethers.formatUnits(usdcBalance, usdcDecimals));
    
    // Define the amount to swap (1 USDC)
    const swapAmount = ethers.parseUnits("1", usdcDecimals);
    console.log(`\nAttempting to swap ${ethers.formatUnits(swapAmount, usdcDecimals)} USDC to NUSD`);
    
    // Check if USDC is supported
    const isSupported = await swap.supportedCollaterals(usdcAddress);
    console.log("Is USDC supported:", isSupported);
    
    // Check allowance
    const allowance = await usdc.allowance(wallet.address, swapAddress);
    console.log("USDC allowance for swap:", ethers.formatUnits(allowance, usdcDecimals));
    
    // Approve USDC if needed
    if (allowance < swapAmount) {
      console.log("Approving USDC for swap...");
      const approveTx = await usdc.approve(swapAddress, ethers.parseUnits("100", usdcDecimals));
      await approveTx.wait();
      console.log("USDC approved successfully");
      
      // Check new allowance
      const newAllowance = await usdc.allowance(wallet.address, swapAddress);
      console.log("New USDC allowance:", ethers.formatUnits(newAllowance, usdcDecimals));
    }
    
    // Try to calculate expected NUSD amount
    console.log("\nCalculating expected NUSD amount...");
    try {
      const expectedNusdAmount = await swap.calculateNUSDAmount(usdcAddress, swapAmount);
      console.log(`Expected NUSD amount: ${ethers.formatUnits(expectedNusdAmount, 18)}`);
    } catch (error) {
      console.error("Error calculating NUSD amount:", error.message);
    }
    
    // Execute the swap
    console.log("\nExecuting the swap...");
    
    try {
      // Log the raw parameters for debugging
      console.log("Parameters for swapToNUSD:");
      console.log("- Token address:", usdcAddress);
      console.log("- Amount:", swapAmount.toString());
      
      // Log the formatted function call for debugging
      const encodedData = swap.interface.encodeFunctionData(
        'swapToNUSD', 
        [usdcAddress, swapAmount]
      );
      console.log("Encoded function call:", encodedData);
      
      // First estimate gas using low-level call
      console.log("\nEstimating gas...");
      const gasEstimate = await provider.estimateGas({
        from: wallet.address,
        to: swapAddress,
        data: encodedData,
      });
      console.log("Estimated gas:", gasEstimate.toString());
      
      // Execute the transaction with extra gas
      const gasLimit = Math.floor(Number(gasEstimate) * 1.5); // 50% extra gas
      console.log("Using gas limit:", gasLimit);
      
      // Create and send the transaction
      const tx = await wallet.sendTransaction({
        to: swapAddress,
        data: encodedData,
        gasLimit: gasLimit
      });
      
      console.log("Transaction sent:", tx.hash);
      
      console.log("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block", receipt.blockNumber);
      
      // Check new NUSD balance
      const nusdBalance = await nusd.balanceOf(wallet.address);
      console.log("New NUSD balance:", ethers.formatUnits(nusdBalance, 18));
      
      console.log("Swap completed successfully!");
    } catch (error) {
      console.error("Error executing swap:", error);
      
      if (error.data) {
        try {
          const decodedError = swap.interface.parseError(error.data);
          console.log("Decoded error:", decodedError);
        } catch (decodeErr) {
          console.log("Could not decode error data");
        }
      }
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