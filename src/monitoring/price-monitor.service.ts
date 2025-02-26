import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderService } from '../blockchain/providers/provider.service';
import { OneInchService } from '../exchanges/oneinch/oneinch.service';
import { formatUnits, parseEther } from 'ethers';

interface TokenPrice {
  symbol: string;
  network: string;
  address: string;
  priceUSD: number;
  timestamp: number;
}

@Injectable()
export class PriceMonitorService {
  private readonly logger = new Logger(PriceMonitorService.name);
  private prices: Map<string, TokenPrice> = new Map();
  private trackedTokens: {
    symbol: string;
    address: { [network: string]: string };
    decimals: number;
  }[] = [];

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
    private oneInchService: OneInchService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeTrackedTokens();
  }

  private initializeTrackedTokens(): void {
    // Add tokens to track for arbitrage opportunities (same as in opportunity finder)
    this.trackedTokens = [
      {
        symbol: 'USDC',
        address: {
          ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          arbitrum: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          optimism: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
          polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        },
        decimals: 6,
      },
      {
        symbol: 'WETH',
        address: {
          ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          optimism: '0x4200000000000000000000000000000000000006',
          polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        },
        decimals: 18,
      },
      {
        symbol: 'WBTC',
        address: {
          ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          arbitrum: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          optimism: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
          polygon: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        },
        decimals: 8,
      },
    ];
  }

  getLatestPrice(symbol: string, network: string): TokenPrice | null {
    const key = `${symbol}-${network}`;
    return this.prices.get(key) || null;
  }

  getAllPrices(): TokenPrice[] {
    return Array.from(this.prices.values());
  }

  getPriceDifference(
    symbol: string,
    network1: string,
    network2: string,
  ): number | null {
    const price1 = this.getLatestPrice(symbol, network1);
    const price2 = this.getLatestPrice(symbol, network2);

    if (!price1 || !price2) {
      return null;
    }

    return ((price2.priceUSD - price1.priceUSD) / price1.priceUSD) * 100;
  }

  @Cron('*/15 * * * * *') // Run every 15 seconds
  async updatePrices(): Promise<void> {
    const networks = this.providerService.getAllNetworks();
    const timestamp = Math.floor(Date.now() / 1000);

    for (const token of this.trackedTokens) {
      for (const network of networks) {
        if (token.address[network]) {
          try {
            const price = await this.getTokenPriceUSD(
              network,
              token.address[network],
            );
            const key = `${token.symbol}-${network}`;

            // Get previous price for comparison
            const previousPrice = this.prices.get(key);

            // Update price in our cache
            this.prices.set(key, {
              symbol: token.symbol,
              network,
              address: token.address[network],
              priceUSD: price,
              timestamp,
            });

            // If price changed significantly (more than 0.5%), emit an event
            if (
              previousPrice &&
              Math.abs(
                ((price - previousPrice.priceUSD) / previousPrice.priceUSD) *
                  100,
              ) > 0.5
            ) {
              this.eventEmitter.emit('price.changed', {
                symbol: token.symbol,
                network,
                previousPrice: previousPrice.priceUSD,
                currentPrice: price,
                percentChange:
                  ((price - previousPrice.priceUSD) / previousPrice.priceUSD) *
                  100,
              });
            }

            this.logger.debug(
              `Updated ${token.symbol} price on ${network}: $${price}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to update ${token.symbol} price on ${network}: ${error.message}`,
            );
          }
        }
      }
    }
  }

  private async getTokenPriceUSD(
    network: string,
    tokenAddress: string,
  ): Promise<number> {
    try {
      // For this example, we'll use 1inch to get token prices by quoting against USDC
      // In a production app, you might want to use a price oracle or aggregator
      const usdcAddress = this.trackedTokens.find((t) => t.symbol === 'USDC')
        ?.address[network];
      if (!usdcAddress) {
        throw new Error(`USDC address not found for network ${network}`);
      }

      // Get a quote for 1 unit of the token to USDC
      const oneUnit = parseEther('1'); // This assumes 18 decimals, adjust if needed
      const quote = await this.oneInchService.getQuote(
        network,
        tokenAddress,
        usdcAddress,
        oneUnit.toString(),
      );

      // Convert to USD price (USDC is pegged to USD)
      const priceInUSDC = Number(formatUnits(quote.toTokenAmount, 6)); // USDC has 6 decimals
      return priceInUSDC;
    } catch (error) {
      this.logger.error(
        `Failed to get price for token ${tokenAddress} on ${network}: ${error.message}`,
      );
      throw error;
    }
  }
}
