export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',

  // Blockchain RPC endpoints
  ethereum: {
    rpc: process.env.ETHEREUM_RPC,
    chainId: 1,
  },
  arbitrum: {
    rpc: process.env.ARBITRUM_RPC,
    chainId: 42161,
  },
  optimism: {
    rpc: process.env.OPTIMISM_RPC,
    chainId: 10,
  },
  polygon: {
    rpc: process.env.POLYGON_RPC,
    chainId: 137,
  },

  // API keys
  oneInch: {
    apiKey: process.env.ONEINCH_API_KEY,
  },

  // Wallet
  wallet: {
    privateKey: process.env.WALLET_PRIVATE_KEY,
  },

  // Trading parameters
  trading: {
    maxSlippage: process.env.MAX_SLIPPAGE || '1', // 1%
    minProfitThreshold: process.env.MIN_PROFIT_THRESHOLD || '0.5', // 0.5%
    maxTradeSize: process.env.MAX_TRADE_SIZE || '1', // 1 ETH
  },

  // Monitoring
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL!, 10) || 30000, // 30 seconds
  },
});
