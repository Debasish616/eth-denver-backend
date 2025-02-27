const { ethers } = require('ethers');
const { unichainProvider, UNICHAIN_DAI, UNICHAIN_WETH } = require('../config');
const AggregatorV3InterfaceABI = require('@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json');

// Uniswap V4 Pool
const poolAddress = "0xYourV4PoolAddress"; // Update after deployment
const poolContract = new ethers.Contract(
  poolAddress,
  ["function slot0() view returns (uint160 sqrtPriceX96, int24 tick)"],
  unichainProvider
);

// Chainlink Price Feed (e.g., ETH/USD on Unichain Sepolia)
const chainlinkFeedAddress = "0xYourChainlinkFeedAddress"; // Replace with real address
const chainlinkContract = new ethers.Contract(chainlinkFeedAddress, AggregatorV3InterfaceABI, unichainProvider);

async function getUniswapV4Price() {
  const { sqrtPriceX96 } = await poolContract.slot0();
  const price = (sqrtPriceX96 ** 2) / (2 ** 192); // Simplified price calc
  return price; // Adjust for decimals
}

async function getChainlinkPrice() {
  const latestRoundData = await chainlinkContract.latestRoundData();
  const price = ethers.utils.formatUnits(latestRoundData.answer, 8); // Chainlink returns 8 decimals
  return parseFloat(price);
}

module.exports = { getUniswapV4Price, getChainlinkPrice };