const { getUniswapV4Price, getChainlinkPrice } = require('./lib/prices');
const { getOraPrediction } = require('./lib/ai');
const { getEOraclePriceValidation, verifyInferenceWithArbAVS } = require('./lib/avs');
const { bridgeTokens } = require('./lib/bridge');

async function runArbitrage() {
  console.log('Starting ArbAgent...');

  const uniswapPrice = await getUniswapV4Price();
  const chainlinkPrice = await getChainlinkPrice();
  const oracleValidation = await getEOraclePriceValidation(chainlinkPrice);
  console.log(`Uniswap V4 (Unichain): ${uniswapPrice}, Chainlink: ${chainlinkPrice}, eOracle: ${oracleValidation.ethPrice}`);

  const prediction = await getOraPrediction(uniswapPrice, chainlinkPrice);
  console.log(`ORA Prediction: ${JSON.stringify(prediction)}`);

  if (prediction.profitable) {
    const avsResult = await verifyInferenceWithArbAVS(uniswapPrice, chainlinkPrice, prediction);
    console.log(`AVS Result: ${JSON.stringify(avsResult)}`);
    if (avsResult.verified) {
      const txId = await bridgeTokens(1000);
      console.log(`Bridged 1000 tokens to BSC Testnet, tx ID: ${txId}`);
    } else {
      console.log('Inference verification failed.');
    }
  } else {
    console.log('No arbitrage opportunity.');
  }
}

if (require.main === module) {
  runArbitrage().catch(console.error);
}

module.exports = { runArbitrage };