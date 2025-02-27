# ArbAgent: Uniswap V4 Arbitrage Agent with Dynamic Fee Hook and Chainlink


## What It Can Do
- **Uniswap V4 Price Fetching**: Queries prices from a Uniswap V4 pool on Unichain with a custom `DynamicFeeHook`.
- **Dynamic Fees**: Adjusts swap fees based on price volatility, optimizing LP profitability.
- **Chainlink Price Feeds**: Retrieves real-time external prices (e.g., ETH/USD) for arbitrage comparison.
- **AI Prediction**: Simulates ORA AI to detect arbitrage opportunities.
- **On-Chain Verification**: Uses EigenLayer AVS for trustless validation.
- **Cross-Chain Bridging**: Transfers tokens to BSC Testnet when profitable using Wormhole.



## Prerequisites
- Node.js v16+.
- MetaMask with Unichain Sepolia and BSC Testnet networks.
- Test ETH (Unichain Sepolia) and BNB (BSC Testnet) from faucets.
- Alchemy API key.

## Setup
1. **Clone**:
   ```bash
   git clone https://github.com/yourusername/arb-agent.git
   cd arb-agent
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   ALCHEMY_KEY=your_alchemy_key
   PRIVATE_KEY=your_private_key
   ```
4. **Compile Contracts**:
   ```bash
   npx hardhat compile
   ```
5. **Deploy Contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia                  