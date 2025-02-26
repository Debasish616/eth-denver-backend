import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
import { ProviderService } from 'src/blockchain/providers/provider.service';
import { OneInchService } from 'src/exchanges/oneinch/oneinch.service';

export interface TokenConfig {
  symbol: string;
  address: Record<string, string>;
  decimals: number;
}

export interface ArbitrageOpportunity {
  sourceNetwork: string;
  targetNetwork: string;
  token: TokenConfig;
  sourcePriceUSD: number;
  targetPriceUSD: number;
  priceDifferencePercent: number;
  estimatedProfit: number;
  estimatedGasCost: number;
  estimatedBridgeCost: number;
  netProfitUSD: number;
  netProfitPercent: number;
  tradeSize: string;
}

@Injectable()
export class OpportunityFinderService {
  private readonly logger = new Logger(OpportunityFinderService.name);
  private readonly trackedTokens: TokenConfig[] = [];

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
    private oneInchService: OneInchService,
  ) {
    // Initialize tracked tokens
    this.initializeTrackedTokens();
  }

  private initializeTrackedTokens(): void {
    // Add tokens to track for arbitrage opportunities
    this.trackedTokens.push(
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
    );
  }

  async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];
    const networks = this.providerService.getAllNetworks();

    // For each token we're tracking
    for (const token of this.trackedTokens) {
      // Get prices on all networks
      const prices: Record<string, number> = {};

      for (const network of networks) {
        if (token.address[network]) {
          try {
            const price = await this.getTokenPriceUSD(
              network,
              token.address[network],
            );
            prices[network] = price;
            this.logger.debug(`${token.symbol} price on ${network}: $${price}`);
          } catch (error) {
            this.logger.error(
              `Failed to get ${token.symbol} price on ${network}: ${error.message}`,
            );
          }
        }
      }

      // Find price differences between networks
      for (const sourceNetwork of networks) {
        if (!prices[sourceNetwork]) continue;

        for (const targetNetwork of networks) {
          if (sourceNetwork === targetNetwork || !prices[targetNetwork])
            continue;

          const priceDifferencePercent =
            ((prices[targetNetwork] - prices[sourceNetwork]) /
              prices[sourceNetwork]) *
            100;

          // Skip if the price difference is too small
          if (priceDifferencePercent <= 0) continue;

          // Calculate estimated costs
          const estimatedGasCost = await this.estimateGasCosts(
            sourceNetwork,
            targetNetwork,
          );
          const estimatedBridgeCost = await this.estimateBridgeCost(
            sourceNetwork,
            targetNetwork,
          );

          // Calculate trade size based on config
          const maxTradeSize = parseUnits(
            this.configService.get<string>('trading.maxTradeSize')!,
            token.decimals,
          );

          // Calculate potential profit
          const tradeSize = maxTradeSize.toString();
          const tradeSizeUSD =
            Number(ethers.utils.formatUnits(maxTradeSize, token.decimals)) *
            prices[sourceNetwork];
          const estimatedProfit = (tradeSizeUSD * priceDifferencePercent) / 100;
          const netProfitUSD =
            estimatedProfit - estimatedGasCost - estimatedBridgeCost;
          const netProfitPercent = (netProfitUSD / tradeSizeUSD) * 100;

          // Skip if the net profit is too small
          const minProfitThreshold = parseFloat(
            this.configService.get<string>('trading.minProfitThreshold')!,
          );
          if (netProfitPercent < minProfitThreshold) continue;

          opportunities.push({
            sourceNetwork,
            targetNetwork,
            token,
            sourcePriceUSD: prices[sourceNetwork],
            targetPriceUSD: prices[targetNetwork],
            priceDifferencePercent,
            estimatedProfit,
            estimatedGasCost,
            estimatedBridgeCost,
            netProfitUSD,
            netProfitPercent,
            tradeSize,
          });
        }
      }
    }

    // Sort opportunities by net profit percentage (highest first)
    return opportunities.sort(
      (a, b) => b.netProfitPercent - a.netProfitPercent,
    );
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

  private async estimateGasCosts(
    sourceNetwork: string,
    targetNetwork: string,
  ): Promise<number> {
    try {
      // Get current gas prices on both networks
      const sourceProvider = this.providerService.getProvider(sourceNetwork);
      const targetProvider = this.providerService.getProvider(targetNetwork);

      const sourceGasPrice = await sourceProvider.getFeeData();
      const targetGasPrice = await targetProvider.getFeeData();

      // Estimate gas usage (these are approximate values)
      const sourceGasUsage = 250000; // For approval + swap on source chain
      const targetGasUsage = 200000; // For swap on target chain

      // Calculate costs in ETH
      // TODO: Fix big int multiplication
      const sourceGasCostETH = sourceGasPrice.gasPrice * sourceGasUsage;
      const targetGasCostETH = targetGasPrice.gasPrice * targetGasUsage;

      // Convert to USD (this is a simplified approach)
      // In a real app, you should get actual ETH prices for each chain
      const ethPriceUSD = 3000; // Example price, should be fetched dynamically

      const sourceGasCostUSD =
        Number(formatEther(sourceGasCostETH)) * ethPriceUSD;
      const targetGasCostUSD =
        Number(formatEther(targetGasCostETH)) * ethPriceUSD;

      return sourceGasCostUSD + targetGasCostUSD;
    } catch (error) {
      this.logger.error(`Failed to estimate gas costs: ${error.message}`);
      return 20; // Default fallback value in USD
    }
  }

  private async estimateBridgeCost(
    sourceNetwork: string,
    targetNetwork: string,
  ): Promise<number> {
    // This would typically involve checking the current bridge fees
    // For simplicity, we'll use static estimates
    const bridgeCosts: Record<string, Record<string, number>> = {
      ethereum: {
        arbitrum: 5,
        optimism: 4,
        polygon: 8,
      },
      arbitrum: {
        ethereum: 10,
        optimism: 12,
        polygon: 12,
      },
      optimism: {
        ethereum: 10,
        arbitrum: 12,
        polygon: 12,
      },
      polygon: {
        ethereum: 15,
        arbitrum: 15,
        optimism: 15,
      },
    };

    return bridgeCosts[sourceNetwork]?.[targetNetwork] || 10; // Default fallback value in USD
  }
}
