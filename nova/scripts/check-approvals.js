const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Starting token approval and minting check...");
    
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
    
    // Get token contracts
    const tokenAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function mint(address to, uint256 amount)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    const mockTokenArtifact = require('../artifacts/contracts/MockToken.sol/MockToken.json');
    const nusdArtifact = require('../artifacts/contracts/NUSD.sol/NUSD.json');
    const swapArtifact = require('../artifacts/contracts/SwapForNUSD.sol/SwapForNUSD.json');
    
    const usdc = new ethers.Contract(usdcAddress, mockTokenArtifact.abi, wallet);
    const nusd = new ethers.Contract(nusdAddress, nusdArtifact.abi, wallet);
    const swap = new ethers.Contract(swapAddress, swapArtifact.abi, wallet);
    
    // Check token decimals
    const usdcDecimals = await usdc.decimals();
    console.log("USDC decimals:", usdcDecimals);
    
    // Check token balances
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log("USDC balance:", ethers.formatUnits(usdcBalance, usdcDecimals));
    
    const nusdDecimals = await nusd.decimals();
    const nusdBalance = await nusd.balanceOf(wallet.address);
    console.log("NUSD balance:", ethers.formatUnits(nusdBalance, nusdDecimals));
    
    // Check if the token is supported by the swap contract
    const isSupported = await swap.supportedCollaterals(usdcAddress);
    console.log("Is USDC supported by swap contract:", isSupported);
    
    if (!isSupported) {
      console.log("USDC is not supported by the swap contract. Trying to add it...");
      try {
        // Add USDC as collateral if not already supported
        const tx = await swap.addCollateral(
          usdcAddress,
          ethers.parseUnits("1", 18), // 1:1 price with NUSD
          usdcDecimals
        );
        await tx.wait();
        console.log("USDC added as collateral successfully");
      } catch (error) {
        console.error("Error adding USDC as collateral:", error.message);
      }
    }
    
    // Mint some USDC tokens if balance is low
    if (usdcBalance < ethers.parseUnits("100", usdcDecimals)) {
      console.log("USDC balance is low. Attempting to mint...");
      try {
        // Try to mint tokens
        const mintAmount = ethers.parseUnits("1000", usdcDecimals);
        const tx = await usdc.mint(wallet.address, mintAmount);
        await tx.wait();
        
        // Check new balance
        const newBalance = await usdc.balanceOf(wallet.address);
        console.log("New USDC balance:", ethers.formatUnits(newBalance, usdcDecimals));
      } catch (error) {
        console.error("Error minting USDC:", error.message);
      }
    }
    
    // Check allowance
    const allowance = await usdc.allowance(wallet.address, swapAddress);
    console.log("Current USDC allowance for swap contract:", ethers.formatUnits(allowance, usdcDecimals));
    
    // Approve the swap contract to spend tokens if allowance is too low
    if (allowance < ethers.parseUnits("100", usdcDecimals)) {
      console.log("Approving the swap contract to spend USDC...");
      try {
        const approveAmount = ethers.parseUnits("10000", usdcDecimals);
        const tx = await usdc.approve(swapAddress, approveAmount);
        await tx.wait();
        
        // Check new allowance
        const newAllowance = await usdc.allowance(wallet.address, swapAddress);
        console.log("New USDC allowance for swap contract:", ethers.formatUnits(newAllowance, usdcDecimals));
      } catch (error) {
        console.error("Error approving USDC:", error.message);
      }
    }
    
    // Check if swap would work
    if (usdcBalance > 0) {
      try {
        // Try to estimate gas for a small swap to see if it would work
        const swapAmount = ethers.parseUnits("1", usdcDecimals);
        
        // Check the actual contract methods
        console.log("Available methods:", Object.keys(swap.interface.functions));
        
        // Try the swap gas estimation
        console.log("\nEstimating gas for swapToNUSD...");
        const estimatedGas = await swap.estimateGas.swapToNUSD(usdcAddress, swapAmount);
        console.log("Estimated gas for swap:", estimatedGas.toString());
        
        // If we get here, the estimation worked, try to actually execute the swap
        console.log("\nAttempting to execute the swap transaction...");
        console.log(`Swapping ${ethers.formatUnits(swapAmount, usdcDecimals)} USDC to NUSD`);
        
        // Include extra gas to be safe
        const gasLimit = estimatedGas.toString() * 1.2;
        console.log("Using gas limit:", Math.floor(gasLimit));
        
        try {
          const tx = await swap.swapToNUSD(
            usdcAddress, 
            swapAmount, 
            { gasLimit: Math.floor(gasLimit) }
          );
          console.log("Transaction sent:", tx.hash);
          
          console.log("Waiting for transaction confirmation...");
          const receipt = await tx.wait();
          console.log("Transaction confirmed in block", receipt.blockNumber);
          
          // Check new NUSD balance
          const newNusdBalance = await nusd.balanceOf(wallet.address);
          console.log("New NUSD balance:", ethers.formatUnits(newNusdBalance, nusdDecimals));
          
          console.log("Swap executed successfully!");
        } catch (txError) {
          console.error("Error executing swap transaction:", txError.message);
          
          // Try to decode error
          if (txError.data) {
            try {
              const decodedError = swap.interface.parseError(txError.data);
              console.log("Decoded error:", decodedError);
            } catch (decodeErr) {
              console.log("Could not decode error data:", txError.data);
            }
          }
        }
      } catch (error) {
        console.error("Error estimating gas for swap:", error.message);
        
        // Try to get more details on why the swap might fail
        console.log("\nTrying to identify the issue...");
        
        try {
          // Check if the contract has the expected method
          console.log("Looking for 'swapToNUSD' method in ABI...");
          const hasSwapMethod = Object.keys(swap.interface.functions).some(fn => 
            fn.startsWith('swapToNUSD(')
          );
          console.log("'swapToNUSD' method found in ABI:", hasSwapMethod);
          
          // Get the exact function signature
          if (hasSwapMethod) {
            const swapFunction = Object.keys(swap.interface.functions).find(fn => 
              fn.startsWith('swapToNUSD(')
            );
            console.log("Exact function signature:", swapFunction);
            
            // Check function params and encoding
            console.log("\nTesting function parameter encoding...");
            const swapAmount = ethers.parseUnits("1", usdcDecimals);
            const encodedData = swap.interface.encodeFunctionData(
              swapFunction, 
              [usdcAddress, swapAmount]
            );
            console.log("Encoded function call:", encodedData);
          }
          
          // Calculate expected NUSD amount
          if (hasSwapMethod) {
            console.log("\nTrying to calculate expected NUSD amount...");
            const swapAmount = ethers.parseUnits("1", usdcDecimals);
            try {
              const nusdAmount = await swap.calculateNUSDAmount(usdcAddress, swapAmount);
              console.log(`Swapping 1 USDC would give ${ethers.formatUnits(nusdAmount, nusdDecimals)} NUSD`);
            } catch (err) {
              console.error("Error calculating NUSD amount:", err.message);
            }
          }
          
          // Try a more complete test that checks various parameters
          console.log("\nPerforming detailed checks on the swap contract...");
          const tokenPrice = await swap.collateralPrices(usdcAddress);
          console.log(`USDC price in contract: ${tokenPrice.toString()}`);
          
          const tokenDecimals = await swap.collateralDecimals(usdcAddress);
          console.log(`USDC decimals in contract: ${tokenDecimals.toString()}`);
          
          // Check if the NUSD contract has minter role set for the swap contract
          console.log("\nChecking if swap contract has minter role for NUSD...");
          const MINTER_ROLE = await nusd.MINTER_ROLE();
          const hasMinterRole = await nusd.hasRole(MINTER_ROLE, swapAddress);
          console.log("Swap contract has minter role:", hasMinterRole);
          
          if (!hasMinterRole) {
            console.log("The swap contract doesn't have minter role for NUSD, which is required");
            console.log("Attempting to grant minter role to swap contract...");
            
            try {
              const DEFAULT_ADMIN_ROLE = await nusd.DEFAULT_ADMIN_ROLE();
              const hasAdminRole = await nusd.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
              
              if (hasAdminRole) {
                const tx = await nusd.grantRole(MINTER_ROLE, swapAddress);
                await tx.wait();
                console.log("Minter role granted to swap contract!");
              } else {
                console.log("Your wallet doesn't have admin role to grant minter role");
              }
            } catch (err) {
              console.error("Error granting minter role:", err.message);
            }
          }
        } catch (err) {
          console.error("Error during diagnostic checks:", err.message);
        }
      }
    }
    
    console.log("\nCheck completed!");
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