const { getUniswapPrice, getPancakePrice } = require('./lib/prices');
const { getOraPrediction } = require('./lib/ai');
const { getEOraclePriceValidation, verifyInferenceWithArbAVS } = require('./lib/avs');
const { bridgeTokens } = require('./lib/bridge');

async function runArbitrage() {
  console.log('Starting ArbAgent...');

  const uniswapPrice = await getUniswapPrice();
  const pancakePrice = await getPancakePrice();
  const oracleValidation = await getEOraclePriceValidation(pancakePrice);
  console.log(`Uniswap: ${uniswapPrice}, Pancake: ${pancakePrice}, eOracle: ${oracleValidation.ethPrice}`);

  const prediction = await getOraPrediction(uniswapPrice, pancakePrice);
  console.log(`ORA Prediction: ${JSON.stringify(prediction)}`);

  if (prediction.profitable) {
    const avsResult = await verifyInferenceWithArbAVS(uniswapPrice, pancakePrice, prediction);
    console.log(`AVS Result: ${JSON.stringify(avsResult)}`);
    if (avsResult.verified) {
      const txId = await bridgeTokens(1000); // Transfer 1000 tokens
      console.log(`Bridged assets to BSC Testnet, tx ID: ${txId}`);
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

module.exports = { runArbitrage };s