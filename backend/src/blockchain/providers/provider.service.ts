import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private providers: Map<string, JsonRpcProvider> = new Map();
  private wallet: Wallet | null = null;

  constructor(private configService: ConfigService) {
    this.initializeProviders();
    this.initializeWallet();
  }

  private initializeProviders(): void {
    const networks = ['ethereum', 'arbitrum', 'optimism', 'polygon'];

    networks.forEach((network) => {
      const rpcUrl = this.configService.get<string>(`${network}.rpc`);
      if (rpcUrl) {
        try {
          const provider = new JsonRpcProvider(rpcUrl);
          this.providers.set(network, provider);
          this.logger.log(`Initialized provider for ${network}`);
        } catch (error) {
          this.logger.error(
            `Failed to initialize provider for ${network}`,
            error,
          );
        }
      }
    });
  }

  private initializeWallet(): void {
    const privateKey = this.configService.get<string>('wallet.privateKey');
    if (privateKey) {
      try {
        // We'll use the Ethereum provider for the wallet initialization
        const provider = this.providers.get('ethereum');
        this.wallet = new ethers.Wallet(privateKey, provider);
        this.logger.log('Wallet initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize wallet', error);
      }
    } else {
      this.logger.warn(
        'No private key provided. Bot will run in read-only mode.',
      );
    }
  }

  getProvider(network: string): JsonRpcProvider {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider for network ${network} not found`);
    }
    return provider;
  }

  getWallet(network: string): ethers.Wallet {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    // Connect the wallet to the specific network provider
    const provider = this.getProvider(network);
    return this.wallet.connect(provider);
  }

  getAllNetworks(): string[] {
    return Array.from(this.providers.keys());
  }
}
