const { ethers } = require('ethers');
const { ChainId, Fetcher, Token } = require('@uniswap/sdk');
const { ethProvider, SEPOLIA_DAI, SEPOLIA_WETH } = require('../config');

// Placeholder Chainlink feed on Sepolia (replace with real address if available)
const chainlinkABI = ['function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)'];
const chainlinkFeed = new ethers.Contract('0xYOUR_SEPOLIA_CHAINLINK_ADDRESS', chainlinkABI, ethProvider);

async function getUniswapPrice() {
  const dai = new Token(ChainId.SEPOLIA, SEPOLIA_DAI, 18);
  const weth = new Token(ChainId.SEPOLIA, SEPOLIA_WETH, 18);
  const pair = await Fetcher.fetchPairData(dai, weth, ethProvider);
  return parseFloat(pair.token0Price.toSignificant(6));
}

async function getPancakePrice() {
  const roundData = await chainlinkFeed.latestRoundData();
  return Number(ethers.utils.formatUnits(roundData[1], 8));
}

module.exports = { getUniswapPrice, getPancakePrice };