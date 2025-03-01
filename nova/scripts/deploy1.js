// Deployment script for test tokens
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load the TestToken contract ABI
const contractPath = path.join(__dirname, "../artifacts/contracts/TestToken.sol/TestToken.json");
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath));

// Configuration for token deployment
const tokens = [
  { name: "USD Coin", symbol: "USDC", decimals: 6 },
  { name: "Tether USD", symbol: "USDT", decimals: 6 },
  { name: "Wrapped Bitcoin", symbol: "WBTC", decimals: 8 },
  { name: "Wrapped Ethereum", symbol: "WETH", decimals: 18 },
];

// Environment setup
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

async function main() {
  if (!PRIVATE_KEY) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY in .env.local file");
  }

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const deployer = wallet.address;

  console.log(`Deploying contracts from: ${deployer}`);
  console.log(`Network: Sepolia Testnet`);

  // Deploy each token
  const deployedTokens = {};

  for (const token of tokens) {
    console.log(`\nDeploying ${token.name} (${token.symbol})...`);
    
    // Create contract factory
    const tokenFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy contract
    const tokenContract = await tokenFactory.deploy(
      token.name,
      token.symbol,
      token.decimals,
      deployer
    );
    
    // Wait for deployment to complete
    await tokenContract.deployTransaction.wait();
    
    const tokenAddress = await tokenContract.getAddress();
    console.log(`${token.symbol} deployed to: ${tokenAddress}`);
    
    deployedTokens[token.symbol] = tokenAddress;
  }

  // Save deployed addresses to a file
  const deploymentData = {
    network: "sepolia",
    tokens: deployedTokens
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployments.json"), 
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\nDeployment complete! Addresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 