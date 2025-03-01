const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Using the corrected frontend ABI
const SWAP_FOR_NUSD_ABI = [
  "function swapToNUSD(address token, uint256 tokenAmount)",
  "function redeemFromNUSD(address token, uint256 nusdAmount)",
  "function calculateNUSDAmount(address token, uint256 tokenAmount) view returns (uint256)",
  "function calculateTokenAmount(address token, uint256 nusdAmount) view returns (uint256)",
  "function supportedCollaterals(address token) view returns (bool)",
  "function collateralPrices(address token) view returns (uint256)",
  "function collateralDecimals(address token) view returns (uint8)",
  "function deposits(address, address) view returns (uint256)",
  "function nusd() view returns (address)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  try {
    console.log("Starting corrected frontend ABI test...");
    
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
    
    // Create contracts using the corrected ABI from frontend
    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, wallet);
    const swap = new ethers.Contract(swapAddress, SWAP_FOR_NUSD_ABI, wallet);
    
    // Get token decimals
    const usdcDecimals = await usdc.decimals();
    console.log("\nUSDC decimals:", usdcDecimals);
    
    // Check balances
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log("USDC balance:", ethers.formatUnits(usdcBalance, usdcDecimals));
    
    // Check if USDC is supported
    const isSupported = await swap.supportedCollaterals(usdcAddress);
    console.log("Is USDC supported:", isSupported);
    
    // Verify price configuration
    const price = await swap.collateralPrices(usdcAddress);
    console.log("USDC price in contract:", price.toString());
    
    // Check our allowance
    const allowance = await usdc.allowance(wallet.address, swapAddress);
    console.log("USDC allowance for swap:", ethers.formatUnits(allowance, usdcDecimals));
    
    // Test gas estimation for swapToNUSD
    try {
      const swapAmount = ethers.parseUnits("1", usdcDecimals);
      console.log("\nEstimating gas for swapToNUSD...");
      
      // Encode the function call
      const encodedData = swap.interface.encodeFunctionData(
        'swapToNUSD',
        [usdcAddress, swapAmount]
      );
      console.log("Encoded function call:", encodedData);
      
      // Estimate gas
      const gasEstimate = await provider.estimateGas({
        from: wallet.address,
        to: swapAddress,
        data: encodedData
      });
      
      console.log("Gas estimation successful!");
      console.log("Estimated gas for swapToNUSD:", gasEstimate.toString());
    } catch (error) {
      console.error("Gas estimation for swapToNUSD failed:", error.message);
    }
    
    // Test gas estimation for redeemFromNUSD
    try {
      const redeemAmount = ethers.parseUnits("1", 18); // NUSD has 18 decimals
      console.log("\nEstimating gas for redeemFromNUSD...");
      
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
      console.log("Estimated gas for redeemFromNUSD:", gasEstimate.toString());
    } catch (error) {
      console.error("Gas estimation for redeemFromNUSD failed:", error.message);
    }
    
    console.log("\nTest complete!");
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