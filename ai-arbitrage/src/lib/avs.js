const { ethers } = require('ethers');
const { ethProvider, AVS_ADDRESS, wallet } = require('../config');

const avsABI = [
  "function verifyInference(uint256 uniswapPrice, uint256 pancakePrice, bool profitable) external returns (bool)",
  "event InferenceVerified(address indexed caller, bool verified, uint256 uniswapPrice, uint256 pancakePrice)"
];
const avsContract = new ethers.Contract(AVS_ADDRESS, avsABI, wallet);

async function getEOraclePriceValidation(pancakePrice) {
  // Placeholder for eOracle (replace with real Sepolia eOracle contract if available)
  return { ethPrice: pancakePrice, verified: true };
}

async function verifyInferenceWithArbAVS(uniswapPrice, pancakePrice, prediction) {
  const uniswapPriceWei = ethers.utils.parseUnits(uniswapPrice.toString(), 6);
  const pancakePriceWei = ethers.utils.parseUnits(pancakePrice.toString(), 8);
  
  const tx = await avsContract.verifyInference(uniswapPriceWei, pancakePriceWei, prediction.profitable);
  const receipt = await tx.wait();
  
  const event = receipt.events.find(e => e.event === 'InferenceVerified');
  return { verified: event.args.verified, proof: receipt.transactionHash };
}

module.exports = { getEOraclePriceValidation, verifyInferenceWithArbAVS };