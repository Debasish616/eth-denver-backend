require('dotenv').config();
const { ethers } = require('ethers');

const ethProvider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`);
const bscProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethProvider);

module.exports = {
  ethProvider,
  bscProvider,
  wallet,
  SEPOLIA_DAI: process.env.SEPOLIA_DAI,
  SEPOLIA_WETH: process.env.SEPOLIA_WETH,
  SEPOLIA_TEST_TOKEN: process.env.SEPOLIA_TEST_TOKEN,
  BSC_TESTNET_ADDRESS: process.env.BSC_TESTNET_ADDRESS,
  AVS_ADDRESS: process.env.AVS_ADDRESS,
};