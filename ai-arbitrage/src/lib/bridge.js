const { Wormhole, signSendWait } = require('@wormhole-foundation/sdk');
const evm = require('@wormhole-foundation/sdk-evm');
const tokenBridge = require('@wormhole-foundation/sdk-evm-tokenbridge');
const { wallet, SEPOLIA_TEST_TOKEN, BSC_TESTNET_ADDRESS } = require('../config');
const { ethers } = require('ethers');

async function bridgeTokens(amount) {
  // Initialize Wormhole with testnet config
  const wh = await Wormhole('Testnet', [evm]);

  // Define source and target chains
  const srcChain = wh.getChain('Sepolia');
  const dstChain = wh.getChain('BinanceSmartChainTestnet');

  // Token to transfer (from .env)
  const tokenAddress = SEPOLIA_TEST_TOKEN;
  const amountWei = ethers.utils.parseUnits(amount.toString(), 18); // Assuming 18 decimals

  // Get Token Bridge clients
  const srcTokenBridge = await srcChain.getTokenBridge();
  const dstTokenBridge = await dstChain.getTokenBridge();

  // Step 1: Initiate transfer on source chain (Sepolia)
  console.log(`Initiating transfer of ${amount} tokens from Sepolia...`);
  const transferTxs = await srcTokenBridge.transfer(
    wallet.address, // Sender
    dstChain.chain, // Target chain
    BSC_TESTNET_ADDRESS, // Recipient on BSC Testnet
    tokenAddress, // Token to transfer
    amountWei // Amount in wei
  );

  // Sign and send the transfer transaction
  const srcTxIds = await signSendWait(srcChain, transferTxs, wallet);
  console.log('Transfer initiated, tx IDs:', srcTxIds);

  // Step 2: Wait for VAA (Wormhole’s proof of transfer)
  const vaaWaitTime = 60000; // 60 seconds (testnet can take a bit)
  console.log('Waiting for VAA from Wormhole guardians...');
  const vaa = await wh.getVaa(
    srcTxIds[srcTxIds.length - 1], // Last tx ID
    srcChain.chain,
    'TokenBridge',
    vaaWaitTime
  );

  if (!vaa) throw new Error('VAA not generated in time.');

  // Step 3: Redeem tokens on target chain (BSC Testnet)
  console.log('Redeeming tokens on BSC Testnet...');
  const redeemTxs = await dstTokenBridge.redeem(
    BSC_TESTNET_ADDRESS, // Recipient
    vaa // VAA from guardians
  );

  // Sign and send the redeem transaction
  const dstWallet = new ethers.Wallet(process.env.PRIVATE_KEY, dstChain.rpc); // BSC provider
  const dstTxIds = await signSendWait(dstChain, redeemTxs, dstWallet);
  console.log('Tokens redeemed, tx IDs:', dstTxIds);

  return dstTxIds[dstTxIds.length - 1]; // Return final tx ID
}

module.exports = { bridgeTokens };