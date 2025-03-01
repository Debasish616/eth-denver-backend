const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("===================================");
  console.log("Testing NUSD Staking Functionality");
  console.log("===================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Load deployment information
  const deploymentPath = path.join(__dirname, "../deployments/sepolia.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("Loaded deployment info from:", deploymentPath);
  
  // Get contract addresses
  const nusdAddress = deploymentInfo.nusd;
  const sNusdAddress = deploymentInfo.sNUSD;
  const stakingAddress = deploymentInfo.stakingContract;
  
  console.log("Contract addresses:");
  console.log("- NUSD:", nusdAddress);
  console.log("- sNUSD:", sNusdAddress);
  console.log("- Staking:", stakingAddress);
  
  // Connect to contracts
  const nusd = await ethers.getContractAt("IERC20", nusdAddress);
  const sNusd = await ethers.getContractAt("IERC20", sNusdAddress);
  const staking = await ethers.getContractAt("SNUSDStaking", stakingAddress);
  
  console.log("\nChecking initial balances...");
  
  // Check initial balances
  const initialNusdBalance = await nusd.balanceOf(deployer.address);
  const initialSNusdBalance = await sNusd.balanceOf(deployer.address);
  
  console.log(`Initial NUSD balance: ${ethers.utils.formatEther(initialNusdBalance)} NUSD`);
  console.log(`Initial sNUSD balance: ${ethers.utils.formatEther(initialSNusdBalance)} sNUSD`);
  
  // Mint NUSD if needed (assuming deployer has minter role)
  if (initialNusdBalance.eq(0)) {
    console.log("\nMinting 1000 NUSD for testing...");
    try {
      // Try to call mint function if it exists
      const nusdFullContract = await ethers.getContractAt("MockToken", nusdAddress);
      const mintTx = await nusdFullContract.mint(deployer.address, ethers.utils.parseEther("1000"));
      await mintTx.wait();
      
      const newNusdBalance = await nusd.balanceOf(deployer.address);
      console.log(`New NUSD balance after minting: ${ethers.utils.formatEther(newNusdBalance)} NUSD`);
    } catch (error) {
      console.log("Could not mint NUSD tokens. Make sure you have enough tokens for testing.");
      console.error(error.message);
    }
  }
  
  // Get updated balance
  const nusdBalance = await nusd.balanceOf(deployer.address);
  
  // Test staking
  if (nusdBalance.gt(0)) {
    const stakeAmount = ethers.utils.parseEther("10"); // Stake 10 NUSD
    
    console.log(`\nStaking ${ethers.utils.formatEther(stakeAmount)} NUSD...`);
    
    // Approve staking contract to spend NUSD
    console.log("Approving staking contract to spend NUSD...");
    const approveTx = await nusd.approve(stakingAddress, stakeAmount);
    await approveTx.wait();
    console.log("Approval successful.");
    
    // Stake NUSD
    console.log("Executing stake transaction...");
    const stakeTx = await staking.stake(stakeAmount);
    await stakeTx.wait();
    console.log("Staking successful!");
    
    // Check balances after staking
    const afterNusdBalance = await nusd.balanceOf(deployer.address);
    const afterSNusdBalance = await sNusd.balanceOf(deployer.address);
    
    console.log("\nBalances after staking:");
    console.log(`NUSD balance: ${ethers.utils.formatEther(afterNusdBalance)} NUSD`);
    console.log(`sNUSD balance: ${ethers.utils.formatEther(afterSNusdBalance)} sNUSD`);
    console.log(`NUSD change: -${ethers.utils.formatEther(nusdBalance.sub(afterNusdBalance))} NUSD`);
    console.log(`sNUSD change: +${ethers.utils.formatEther(afterSNusdBalance.sub(initialSNusdBalance))} sNUSD`);
    
    // Test initiating unstake (if we received sNUSD)
    if (afterSNusdBalance.gt(0)) {
      const unstakeAmount = ethers.utils.parseEther("5"); // Unstake 5 sNUSD
      
      console.log(`\nInitiating unstake of ${ethers.utils.formatEther(unstakeAmount)} sNUSD...`);
      
      // Approve staking contract to spend sNUSD
      console.log("Approving staking contract to spend sNUSD...");
      const approveUnstakeTx = await sNusd.approve(stakingAddress, unstakeAmount);
      await approveUnstakeTx.wait();
      console.log("Approval successful.");
      
      // Initiate unstake
      console.log("Executing initiateUnstake transaction...");
      const unstakeTx = await staking.initiateUnstake(unstakeAmount);
      await unstakeTx.wait();
      console.log("Unstake request successful!");
      
      // Check balances after unstaking
      const finalNusdBalance = await nusd.balanceOf(deployer.address);
      const finalSNusdBalance = await sNusd.balanceOf(deployer.address);
      
      console.log("\nBalances after initiating unstake:");
      console.log(`NUSD balance: ${ethers.utils.formatEther(finalNusdBalance)} NUSD`);
      console.log(`sNUSD balance: ${ethers.utils.formatEther(finalSNusdBalance)} sNUSD`);
      
      // Check unstake request
      const requestCount = await staking.getUnstakeRequestCount(deployer.address);
      console.log(`\nUnstake request count: ${requestCount}`);
      
      if (requestCount.gt(0)) {
        const requestId = requestCount.sub(1); // Get the latest request
        const request = await staking.getUnstakeRequest(deployer.address, requestId);
        
        console.log("\nUnstake request details:");
        console.log(`Amount: ${ethers.utils.formatEther(request[0])} sNUSD`);
        console.log(`Unlock time: ${new Date(request[1].toNumber() * 1000).toLocaleString()}`);
        console.log(`Completed: ${request[2]}`);
        
        const unlockTimeMs = request[1].toNumber() * 1000;
        const currentTimeMs = Date.now();
        const timeLeftMs = unlockTimeMs - currentTimeMs;
        
        if (timeLeftMs > 0) {
          console.log(`Time until unlock: ${Math.ceil(timeLeftMs / (1000 * 60 * 60 * 24))} days`);
        } else {
          console.log("Unlock period is over. The request can be completed.");
        }
      }
    }
  } else {
    console.log("\nNo NUSD tokens available for testing. Please acquire some NUSD first.");
  }
  
  console.log("\n===================================");
  console.log("Staking Test Complete");
  console.log("===================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 