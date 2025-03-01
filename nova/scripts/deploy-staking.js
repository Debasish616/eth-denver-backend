const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting Staking Contract Deployment");
  console.log("===================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Load deployment information from sepolia.json
  const deploymentPath = path.join(__dirname, "../deployments/sepolia.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("Loaded deployment info from:", deploymentPath);
  
  // Get the NUSD token address from existing deployment
  const nusdAddress = deploymentInfo.nusd;
  console.log("Using existing NUSD token at address:", nusdAddress);
  
  // Deploy sNUSD token
  console.log("\nDeploying sNUSD token...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const sNUSD = await MockToken.deploy("Staked NUSD", "sNUSD", 18);
  await sNUSD.deployed();
  console.log("sNUSD token deployed to:", sNUSD.address);
  
  // Deploy SNUSDStaking contract
  console.log("\nDeploying SNUSDStaking contract...");
  const SNUSDStaking = await ethers.getContractFactory("SNUSDStaking");
  const staking = await SNUSDStaking.deploy(nusdAddress, sNUSD.address);
  await staking.deployed();
  console.log("SNUSDStaking contract deployed to:", staking.address);
  
  // Grant minter role to the staking contract
  console.log("\nSetting up permissions...");
  const MINTER_ROLE = await sNUSD.MINTER_ROLE();
  await sNUSD.grantRole(MINTER_ROLE, staking.address);
  console.log("Granted MINTER_ROLE to staking contract");
  
  // Mint initial supply of sNUSD to the staking contract
  const initialSupply = ethers.utils.parseEther("1000000"); // 1 million sNUSD
  await sNUSD.mint(staking.address, initialSupply);
  console.log(`Minted ${ethers.utils.formatEther(initialSupply)} sNUSD to the staking contract`);
  
  // Update deployment info
  deploymentInfo.sNUSD = sNUSD.address;
  deploymentInfo.stakingContract = staking.address;
  
  // Save updated deployment info
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nUpdated deployment information saved to:", deploymentPath);
  
  console.log("\nDeployment complete!");
  console.log("=====================");
  console.log("NUSD Token:", nusdAddress);
  console.log("sNUSD Token:", sNUSD.address);
  console.log("Staking Contract:", staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 