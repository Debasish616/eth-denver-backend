import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, TransactionReceipt, ZeroAddress, zeroPadValue } from 'ethers';
import { ProviderService } from 'src/blockchain/providers/provider.service';

// Wormhole Token Bridge ABI (simplified)
const WORMHOLE_TOKEN_BRIDGE_ABI = [
  'function transferTokens(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) external payable returns (uint64 sequence)',
  'function wrapAndTransferETH(uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) external payable returns (uint64 sequence)',
];

@Injectable()
export class WormholeService {
  private readonly logger = new Logger(WormholeService.name);
  private readonly tokenBridgeAddresses: Map<string, string> = new Map();
  private readonly chainIds: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
  ) {
    // Initialize Wormhole Token Bridge addresses per network
    this.tokenBridgeAddresses.set(
      'ethereum',
      '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
    );
    this.tokenBridgeAddresses.set(
      'polygon',
      '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
    );
    this.tokenBridgeAddresses.set(
      'arbitrum',
      '0x0b2402144Bb366A632D14B83F244D2e0e21bD39c',
    );
    this.tokenBridgeAddresses.set(
      'optimism',
      '0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b',
    );

    // Map network names to Wormhole chain IDs
    this.chainIds.set('ethereum', 2);
    this.chainIds.set('polygon', 5);
    this.chainIds.set('arbitrum', 23);
    this.chainIds.set('optimism', 24);
  }

  private getTokenBridgeContract(network: string): ethers.Contract {
    const address = this.tokenBridgeAddresses.get(network);
    if (!address) {
      throw new Error(`No Wormhole Token Bridge address found for ${network}`);
    }

    const wallet = this.providerService.getWallet(network);
    return new ethers.Contract(address, WORMHOLE_TOKEN_BRIDGE_ABI, wallet);
  }

  private getWormholeChainId(network: string): number {
    const chainId = this.chainIds.get(network);
    if (!chainId) {
      throw new Error(`No Wormhole chain ID found for ${network}`);
    }
    return chainId;
  }

  private calculateWormholeRecipient(address: string): string {
    // Convert Ethereum address to Wormhole format (32 bytes)
    return zeroPadValue(address, 32);
  }

  async bridgeTokens(
    sourceNetwork: string,
    targetNetwork: string,
    tokenAddress: string,
    amount: string,
  ): Promise<TransactionReceipt> {
    try {
      const wallet = this.providerService.getWallet(sourceNetwork);
      const bridgeContract = this.getTokenBridgeContract(sourceNetwork);
      const targetChainId = this.getWormholeChainId(targetNetwork);
      const recipient = this.calculateWormholeRecipient(wallet.address);

      // Approve token if it's not native ETH
      if (tokenAddress !== ZeroAddress) {
        await this.approveTokens(sourceNetwork, tokenAddress, amount);
      }

      let tx;
      if (tokenAddress === ZeroAddress) {
        // Bridge native ETH
        tx = await bridgeContract.wrapAndTransferETH(
          targetChainId,
          recipient,
          0, // arbiter fee
          Math.floor(Math.random() * 1000000), // nonce
          { value: amount },
        );
      } else {
        // Bridge ERC20 token
        tx = await bridgeContract.transferTokens(
          tokenAddress,
          amount,
          targetChainId,
          recipient,
          0, // arbiter fee
          Math.floor(Math.random() * 1000000), // nonce
        );
      }

      this.logger.log(
        `Bridge transaction sent on ${sourceNetwork}: ${tx.hash}`,
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      this.logger.log(
        `Bridge transaction confirmed on ${sourceNetwork}: ${receipt.transactionHash}`,
      );

      return receipt;
    } catch (error) {
      this.logger.error(`Failed to bridge tokens: ${error.message}`);
      throw error;
    }
  }

  private async approveTokens(
    network: string,
    tokenAddress: string,
    amount: string,
  ): Promise<void> {
    try {
      const wallet = this.providerService.getWallet(network);
      const bridgeAddress = this.tokenBridgeAddresses.get(network);

      // Get token contract
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)',
        ],
        wallet,
      );

      // Check if allowance is sufficient
      const allowance = await tokenContract.allowance(
        wallet.address,
        bridgeAddress,
      );
      if (allowance.lt(amount)) {
        // Approve max amount
        const tx = await tokenContract.approve(
          bridgeAddress,
          ethers.constants.MaxUint256,
        );
        await tx.wait();
        this.logger.log(
          `Approved Wormhole bridge for token ${tokenAddress} on ${network}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to approve tokens for bridge: ${error.message}`,
      );
      throw error;
    }
  }
}
