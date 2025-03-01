# ETH Denver Frontend

## Token Contracts Deployment

This repository includes ERC20 token contracts for testing on Sepolia testnet. Each token contract has a public mint function that allows users to mint up to 1000 tokens at once, with a cooldown period between mints.

### Setup for Contract Deployment

#### Option 1: Real Deployment (Requires Sepolia ETH)

1. Install the necessary dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following variables:

```
# Private key for deploying contracts (without 0x prefix)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URL for Sepolia testnet (get one from Alchemy, Infura, etc.)
SEPOLIA_RPC_URL=https://your-sepolia-rpc-url

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

3. Compile the contracts:

```bash
npx hardhat compile
```

4. Deploy the contracts to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. The deployment script will save the contract addresses to a file at `deployments/sepolia.json`. You should update the token addresses in the `tokens` array in `app/swap/page.tsx` with these new addresses.

#### Option 2: Using Simulated Deployment (Current Setup)

The repository currently includes a simulated deployment file at `deployments/sepolia.json` with addresses that match the ones already in the `tokens` array in `app/swap/page.tsx`. You can use these addresses for development and testing without deploying new contracts.

To use the simulated deployment:

1. Make sure the token addresses in `app/swap/page.tsx` match those in `deployments/sepolia.json`.
2. When users click the "Mint" buttons, the app will attempt to call the `mint` function on these contracts.
3. For this to work, someone must have deployed compatible ERC20 contracts with public mint functions at these addresses on Sepolia.

### Token Features

Each test token contract includes:

- A public `mint` function allowing anyone to mint up to 1000 tokens at once
- A cooldown period of 1 hour between mints to prevent abuse
- Standard ERC20 functions (transfer, approve, etc.)
- Owner-only admin functions for unlimited minting and parameter updates

### How Users Can Get Test Tokens

Users can get test tokens in their MetaMask wallet by:

1. Connecting their wallet to the app
2. Switching to Sepolia testnet
3. Clicking "Add to Wallet" for a specific token to add it to MetaMask
4. Clicking "Mint [TOKEN]" to mint 1000 tokens of that specific type
5. Alternatively, clicking "Mint All Test Tokens" to mint all tokens at once

The tokens will appear in their MetaMask wallet with the correct balance after minting is successful.

## Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 