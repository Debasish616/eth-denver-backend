const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting redemption test...");
    
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
    
    // Get token decimals
    const usdcDecimals = await usdc.decimals();
    const nusdDecimals = await nusd.decimals();
    console.log("\nUSDC decimals:", usdcDecimals);
    console.log("NUSD decimals:", nusdDecimals);
    
    // Check token balances
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log("USDC balance:", ethers.formatUnits(usdcBalance, usdcDecimals));
    
    const nusdBalance = await nusd.balanceOf(wallet.address);
    console.log("NUSD balance:", ethers.formatUnits(nusdBalance, nusdDecimals));
    
    // Check allowance
    const nusdAllowance = await nusd.allowance(wallet.address, swapAddress);
    console.log("NUSD allowance for swap contract:", ethers.formatUnits(nusdAllowance, nusdDecimals));
    
    // Approve NUSD if needed
    if (nusdAllowance < ethers.parseUnits("1", nusdDecimals)) {
      console.log("Approving NUSD for redemption...");
      const approveTx = await nusd.approve(swapAddress, ethers.parseUnits("1000", nusdDecimals));
      await approveTx.wait();
      console.log("NUSD approved successfully");
      
      const newAllowance = await nusd.allowance(wallet.address, swapAddress);
      console.log("New NUSD allowance:", ethers.formatUnits(newAllowance, nusdDecimals));
    }
    
    // Check user's deposit in the swap contract
    const userDeposit = await swap.deposits(usdcAddress, wallet.address);
    console.log("User's USDC deposit in swap contract:", ethers.formatUnits(userDeposit, usdcDecimals));
    
    // Calculate expected token amount for 1 NUSD
    try {
      console.log("\nCalculating expected token amount for redemption...");
      const nusdAmount = ethers.parseUnits("1", nusdDecimals); // 1 NUSD
      const expectedTokens = await swap.calculateTokenAmount(usdcAddress, nusdAmount);
      console.log(`1 NUSD should give ${ethers.formatUnits(expectedTokens, usdcDecimals)} USDC`);
    } catch (error) {
      console.error("Error calculating token amount:", error.message);
    }
    
    // Debug the function signature
    const redeemFunctionFragment = swapArtifact.abi.find(
      fn => fn.type === 'function' && fn.name === 'redeemFromNUSD'
    );
    if (redeemFunctionFragment) {
      console.log("\nRedeemFromNUSD function details:");
      console.log("- Name:", redeemFunctionFragment.name);
      console.log("- Inputs:", redeemFunctionFragment.inputs.map(i => `${i.type} ${i.name}`).join(", "));
      
      // Create the function signature
      const functionSignature = `redeemFromNUSD(address,uint256)`;
      const selector = ethers.keccak256(ethers.toUtf8Bytes(functionSignature)).slice(0, 10);
      console.log("- Function selector:", selector);
      
      // Check against the one in the error message
      const errorSelector = "0x57c6412a";
      console.log("- Selector in error:", errorSelector);
      console.log("- Selectors match:", selector === errorSelector);
    }
    
    console.log("\nAttempting to call redeemFromNUSD with the right parameters...");
    
    // Redeem amount: 1 NUSD
    const redeemAmount = ethers.parseUnits("1", nusdDecimals);
    
    console.log("Parameters for redeemFromNUSD:");
    console.log("- Token address (USDC):", usdcAddress);
    console.log("- NUSD amount:", ethers.formatUnits(redeemAmount, nusdDecimals));
    
    // Test with low-level approach first
    try {
      console.log("\nTrying low-level call for gas estimation...");
      
      // Encode the function call
      const encodedData = swap.interface.encodeFunctionData(
        'redeemFromNUSD',
        [usdcAddress, redeemAmount]
      );
      console.log("Encoded function call:", encodedData);
      
      // Estimate gas
      const gasEstimate = await provider.estimateGas({
        from: wallet.address,
        to: swapAddress,
        data: encodedData
      });
      
      console.log("Gas estimation successful!");
      console.log("Estimated gas:", gasEstimate.toString());
      
      // Execute the transaction
      console.log("\nExecuting redemption transaction...");
      const gasLimit = Math.floor(Number(gasEstimate) * 1.5);
      
      const tx = await wallet.sendTransaction({
        to: swapAddress,
        data: encodedData,
        gasLimit
      });
      
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block", receipt.blockNumber);
      
      // Check new balances
      const newNusdBalance = await nusd.balanceOf(wallet.address);
      console.log("New NUSD balance:", ethers.formatUnits(newNusdBalance, nusdDecimals));
      
      const newUsdcBalance = await usdc.balanceOf(wallet.address);
      console.log("New USDC balance:", ethers.formatUnits(newUsdcBalance, usdcDecimals));
      
    } catch (error) {
      console.error("Low-level call failed:", error.message);
      
      if (error.message.includes("insufficient funds")) {
        console.log("\n⚠️ You don't have enough USDC deposited in the swap contract!");
        console.log("You need to swap USDC to NUSD first to create a deposit");
      }
      
      if (error.message.includes("insufficient balance")) {
        console.log("\n⚠️ Insufficient NUSD balance for redemption");
      }
      
      // Try to examine swap contract state
      console.log("\nExamining swap contract state...");
      
      // Check collateral price and configuration
      const collateralPrice = await swap.collateralPrices(usdcAddress);
      console.log("USDC price in contract:", collateralPrice.toString());
      
      const collateralDecimals = await swap.collateralDecimals(usdcAddress);
      console.log("USDC decimals in contract:", collateralDecimals.toString());
      
      // Check if the NUSD token is correctly linked
      const nusdContractAddress = await swap.nusd();
      console.log("NUSD address in swap contract:", nusdContractAddress);
      console.log("Matches expected NUSD address:", nusdContractAddress === nusdAddress);
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