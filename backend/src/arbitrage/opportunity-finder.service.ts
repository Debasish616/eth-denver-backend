import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
import { ProviderService } from 'src/blockchain/providers/provider.service';
import { sleep } from 'src/common/utils/utils';
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
          ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          arbitrum: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
          optimism: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
          polygon: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        },
        decimals: 6,
      },
      {
        symbol: 'WETH',
        address: {
          ethereum: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          arbitrum: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
          optimism: '0x4200000000000000000000000000000000000006',
          polygon: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        },
        decimals: 18,
      },
      {
        symbol: 'WBTC',
        address: {
          ethereum: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          arbitrum: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
          optimism: '0x68f180fcce6836688e9084f035309e29bf0a2095',
          polygon: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        },
        decimals: 8,
      },
    );
  }

  async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];
    const networks = this.providerService.getAllNetworks();

    // Fetch all token prices across all networks in one batch per network
    const tokenPricesInUSDByNetwork: Record<
      string,
      Record<string, number>
    > = {};

    for (const network of networks) {
      // Filter out only the tokens that exist on this network
      const tokenAddresses = this.trackedTokens
        .filter((token) => token.address[network])
        .map((token) => token.address[network]);

      try {
        const tokenPrices = await this.oneInchService.getTokenPriceOnChainInUSD(
          network,
          tokenAddresses,
        );

        tokenPricesInUSDByNetwork[network] = tokenPrices;
        this.logger.debug(
          `Fetched prices for ${tokenAddresses.length} tokens on ${network}`,
        );
        await sleep(1500); // Rate limiting
      } catch (error) {
        this.logger.error(
          `Failed to get token prices on ${network}: ${error.message}`,
        );
        tokenPricesInUSDByNetwork[network] = {};
      }
    }

    // Find arbitrage opportunities for each token
    for (const token of this.trackedTokens) {
      this.logger.debug(`Checking arbitrage opportunities for ${token.symbol}`);

      // Extract prices for this token on all networks
      const tokenPricesByNetwork: Record<string, number> = {};

      // Get token price by network
      for (const network of networks) {
        console.log(`Checking ${token.symbol} on ${network}`);

        if (token.address[network] && tokenPricesInUSDByNetwork[network]) {
          const price =
            tokenPricesInUSDByNetwork[network][token.address[network]];

          if (price) {
            tokenPricesByNetwork[network] = price;
            this.logger.debug(`${token.symbol} price on ${network}: $${price}`);
          }
        }
      }

      // Find price differences between networks
      for (const sourceNetwork of networks) {
        if (!tokenPricesByNetwork[sourceNetwork]) continue;

        for (const targetNetwork of networks) {
          if (
            sourceNetwork === targetNetwork ||
            !tokenPricesByNetwork[targetNetwork]
          )
            continue;

          const sourcePriceUSD = tokenPricesByNetwork[sourceNetwork];
          const targetPriceUSD = tokenPricesByNetwork[targetNetwork];

          const priceDifferencePercent =
            ((targetPriceUSD - sourcePriceUSD) / sourcePriceUSD) * 100;

          // Skip if the price difference is negative or too small
          if (priceDifferencePercent <= 0) continue;

          this.logger.log(
            `Price difference ${token.symbol} for between ${sourceNetwork} and ${targetNetwork}: ${priceDifferencePercent}%`,
          );

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
            Number(formatUnits(maxTradeSize, token.decimals)) * sourcePriceUSD;
          const estimatedProfit = (tradeSizeUSD * priceDifferencePercent) / 100;
          const netProfitUSD =
            estimatedProfit - estimatedGasCost - estimatedBridgeCost;
          const netProfitPercent = (netProfitUSD / tradeSizeUSD) * 100;

          // Skip if the net profit is too small
          const minProfitThreshold = parseFloat(
            this.configService.get<string>('trading.minProfitThreshold')!,
          );

          // if (netProfitPercent < minProfitThreshold) continue;

          const opportunity: ArbitrageOpportunity = {
            sourceNetwork,
            targetNetwork,
            token,
            sourcePriceUSD,
            targetPriceUSD,
            priceDifferencePercent,
            estimatedProfit,
            estimatedGasCost,
            estimatedBridgeCost,
            netProfitUSD,
            netProfitPercent,
            tradeSize,
          };

          opportunities.push(opportunity);
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
    return 1;
    try {
      // For this example, we'll use 1inch to get token prices by quoting against USDC
      // In a production app, you might want to use a price oracle or aggregator
      // const usdcAddress = this.trackedTokens.find((t) => t.symbol === 'USDC')
      //   ?.address[network];
      // if (!usdcAddress) {
      //   throw new Error(`USDC address not found for network ${network}`);
      // }
      // Get a quote for 1 unit of the token to USDC
      // const oneUnit = parseEther('1'); // This assumes 18 decimals, adjust if needed
      // const quote = await this.oneInchService.getQuote(
      //   network,
      //   tokenAddress,
      //   usdcAddress,
      //   oneUnit.toString(),
      // );
      // const usdPrice = await this.oneInchService.getTokenPriceUSD(network, [
      //   tokenAddress,
      // ]);
      // Convert to USD price (USDC is pegged to USD)
      // const priceInUSDC = Number(formatUnits(usdPrice, 6)); // USDC has 6 decimals
      // return priceInUSDC;
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

      const sourceGasPrice = BigInt(
        (await sourceProvider.getFeeData()).gasPrice ?? 1,
      );
      const targetGasPrice = BigInt(
        (await targetProvider.getFeeData()).gasPrice ?? 1,
      );

      // Estimate gas usage (these are approximate values)
      const sourceGasUsage = BigInt(250000); // For approval + swap on source chain
      const targetGasUsage = BigInt(200000); // For swap on target chain

      // Calculate costs in ETH
      // TODO: Fix big int multiplication
      const sourceGasCostETH = sourceGasPrice * sourceGasUsage;
      const targetGasCostETH = targetGasPrice * targetGasUsage;

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
