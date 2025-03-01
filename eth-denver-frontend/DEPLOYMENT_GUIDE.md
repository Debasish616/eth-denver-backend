# Token Contracts Deployment Guide

This guide explains how to deploy the ERC20 token contracts needed for the minting functionality in this application.

## Overview

The application allows users to mint 1000 tokens each of USDC, USDT, WBTC, and WETH on the Sepolia testnet. For this to work, ERC20 token contracts with a public `mint` function need to be deployed at the addresses specified in the `tokens` array in `app/swap/page.tsx`.

## Current Configuration

The current token addresses in the application are:

- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- USDT: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
- WBTC: `0xCA060F5c1876A8D4A15E938390D464e8355A0D80`
- WETH: `0x700868CAf088A02eD9d5E936d95Aa182cf11Fb98`

## Deployment Steps

### Prerequisites

1. Sepolia ETH to pay for gas fees (get from a faucet like https://sepoliafaucet.com)
2. A private key with Sepolia ETH
3. An RPC URL for Sepolia (from Alchemy, Infura, etc.)
4. Etherscan API key for contract verification (optional)

### Setup Environment

1. Create a `.env.local` file in the project root with:

```
# Private key for deploying contracts (without 0x prefix)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URL for Sepolia testnet
SEPOLIA_RPC_URL=https://your-sepolia-rpc-url

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This will:
1. Deploy TestToken contracts for USDC, USDT, WBTC, and WETH
2. Verify them on Etherscan (if API key provided)
3. Save the deployment addresses to `deployments/sepolia.json`

### Update Frontend

If the deployed addresses differ from the current ones, update the `tokens` array in `app/swap/page.tsx` with the new addresses from `deployments/sepolia.json`.

## Contract Features

Each deployed token contract has:

- A public `mint` function that lets users mint up to 1000 tokens at once
- A 1-hour cooldown between mints to prevent abuse
- Standard ERC20 functionality
- Owner-only functions to mint unlimited tokens and adjust parameters

## Testing the Deployment

After deployment:

1. Run the app: `npm run dev`
2. Connect MetaMask to Sepolia
3. Click "Add to Wallet" to add a token to MetaMask
4. Click "Mint" to mint 1000 tokens
5. The tokens should appear in your MetaMask wallet

## Troubleshooting

If you see "No contract deployed" errors:
- Confirm your contract deployment was successful
- Verify the addresses in the frontend match your deployed contracts
- Check that you have Sepolia ETH in your wallet
- Ensure you're connected to the Sepolia network in MetaMask 