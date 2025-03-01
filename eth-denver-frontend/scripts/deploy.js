// Script to deploy test tokens using Hardhat
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts from: ${deployer.address}`);
  console.log(`Network: ${hre.network.name}`);

  // Token configurations
  const tokens = [
    { name: "USD Coin", symbol: "USDC", decimals: 6 },
    { name: "Tether USD", symbol: "USDT", decimals: 6 },
    { name: "Wrapped Bitcoin", symbol: "WBTC", decimals: 8 },
    { name: "Wrapped Ethereum", symbol: "WETH", decimals: 18 },
  ];

  // Deploy each token
  const deployedTokens = {};

  const TestToken = await hre.ethers.getContractFactory("TestToken");

  for (const token of tokens) {
    console.log(`\nDeploying ${token.name} (${token.symbol})...`);
    
    // Deploy contract
    const tokenContract = await TestToken.deploy(
      token.name,
      token.symbol,
      token.decimals,
      deployer.address
    );
    
    await tokenContract.waitForDeployment();
    
    const tokenAddress = await tokenContract.getAddress();
    console.log(`${token.symbol} deployed to: ${tokenAddress}`);
    
    // Verify contract if not on localhost
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log(`Waiting for block confirmations...`);
      // Wait for 5 block confirmations for better reliability
      await tokenContract.deploymentTransaction().wait(5);
      
      console.log(`Verifying contract on ${hre.network.name} explorer...`);
      try {
        await hre.run("verify:verify", {
          address: tokenAddress,
          constructorArguments: [
            token.name,
            token.symbol,
            token.decimals,
            deployer.address
          ],
        });
        console.log(`${token.symbol} verified on explorer!`);
      } catch (error) {
        console.log(`Verification failed: ${error.message}`);
      }
    }
    
    deployedTokens[token.symbol] = tokenAddress;
  }

  // Save deployed addresses to a file
  const deploymentData = {
    network: hre.network.name,
    tokens: deployedTokens,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`), 
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\nDeployment complete! Addresses saved to deployments file");
  console.log("\nDeployed Tokens:");
  for (const [symbol, address] of Object.entries(deployedTokens)) {
    console.log(`${symbol}: ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 