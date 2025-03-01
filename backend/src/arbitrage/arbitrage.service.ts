import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import {
  ArbitrageOpportunity,
  OpportunityFinderService,
} from './opportunity-finder.service';
import { OneInchService } from '../exchanges/oneinch/oneinch.service';
import { WormholeService } from '../bridges/wormhole/wormhole.service';
import { ElizaService } from '../bots/eliza/eliza.service';

@Injectable()
export class ArbitrageService {
  private readonly logger = new Logger(ArbitrageService.name);
  private botId: string | null = null;
  private isExecutingArbitrage = false;

  constructor(
    private configService: ConfigService,
    private opportunityFinder: OpportunityFinderService,
    private oneInchService: OneInchService,
    private wormholeService: WormholeService,
    private elizaService: ElizaService,
  ) {
    void this.initializeBot();
  }

  private async initializeBot(): Promise<void> {
    try {
      // Create ElizaOS bot
      const bot = await this.elizaService.createBot(
        'ArbX Cross-Chain Arbitrage Bot',
        'Automated cross-chain arbitrage bot that monitors price differences across multiple chains',
      );

      this.botId = bot.id;
      this.logger.log(`Initialized Eliza bot with ID: ${this.botId}`);

      // Define initial strategy
      await this.elizaService.defineStrategy(
        this.botId,
        [
          { sourceChain: 'ethereum', targetChain: 'arbitrum', token: 'USDC' },
          { sourceChain: 'ethereum', targetChain: 'arbitrum', token: 'WETH' },
          { sourceChain: 'ethereum', targetChain: 'polygon', token: 'WBTC' },
        ],
        this.configService.get<string>('trading.minProfitThreshold')!,
        this.configService.get<string>('trading.maxTradeSize')!,
      );

      // Start the bot
      await this.elizaService.startBot(this.botId);
    } catch (error) {
      this.logger.error(`Failed to initialize Eliza bot: ${error.message}`);
    }
  }

  @Cron('*/30 * * * * *') // Run every 30 seconds
  async scanForArbitrageOpportunities(): Promise<void> {
    if (this.isExecutingArbitrage) {
      this.logger.log('Already executing arbitrage, skipping scan...');
      return;
    }

    try {
      this.logger.log('Scanning for arbitrage opportunities...');

      // Find opportunities
      const opportunities =
        await this.opportunityFinder.findArbitrageOpportunities();

      if (opportunities.length === 0) {
        this.logger.log('No profitable arbitrage opportunities found');
        return;
      }

      // Log top opportunities
      this.logger.log(
        `Found ${opportunities.length} potential arbitrage opportunities`,
      );
      opportunities.slice(0, 3).forEach((opp, index) => {
        this.logger.log(
          `Opportunity #${index + 1}: ${opp.token.symbol} from ${opp.sourceNetwork} to ${opp.targetNetwork} ` +
            `with ${opp.netProfitPercent.toFixed(2)}% net profit ($${opp.netProfitUSD.toFixed(2)})`,
        );
      });

      // Execute the best opportunity
      const bestOpportunity = opportunities[0];
      if (bestOpportunity && this.botId) {
        await this.executeArbitrage(bestOpportunity);
      }
    } catch (error) {
      this.logger.error(
        `Error scanning for arbitrage opportunities: ${error.message}`,
      );
    }
  }

  private async executeArbitrage(
    opportunity: ArbitrageOpportunity,
  ): Promise<void> {
    this.isExecutingArbitrage = true;

    try {
      this.logger.log(
        `Executing arbitrage: ${opportunity.token.symbol} from ${opportunity.sourceNetwork} ` +
          `to ${opportunity.targetNetwork} with expected profit of $${opportunity.netProfitUSD.toFixed(2)}`,
      );

      // 1. Execute via ElizaOS (primary method)
      if (this.botId) {
        try {
          await this.elizaService.executeAction(this.botId, {
            type: 'arbitrage',
            network: opportunity.sourceNetwork,
            data: {
              sourceNetwork: opportunity.sourceNetwork,
              targetNetwork: opportunity.targetNetwork,
              tokenAddress:
                opportunity.token.address[opportunity.sourceNetwork],
              amount: opportunity.tradeSize,
              targetTokenAddress:
                opportunity.token.address[opportunity.targetNetwork],
            },
          });

          this.logger.log('Successfully executed arbitrage via ElizaOS');
          this.isExecutingArbitrage = false;
          return;
        } catch (error) {
          this.logger.error(
            `Failed to execute via ElizaOS, falling back to manual execution: ${error.message}`,
          );
        }
      }

      // 2. Manual execution (fallback)
      await this.executeManualArbitrage(opportunity);
    } catch (error) {
      this.logger.error(`Error executing arbitrage: ${error.message}`);
    } finally {
      this.isExecutingArbitrage = false;
    }
  }

  //   TODO: Implement this method
  private async executeManualArbitrage(
    opportunity: ArbitrageOpportunity,
  ): Promise<void> {
    try {
      const tokenAddress = opportunity.token.address[opportunity.sourceNetwork];
      const slippage = this.configService.get<string>('trading.maxSlippage');

      // Step 1: If needed, swap to the target token on the source chain
      // (For simplicity, we're assuming we already have the token)

      // Step 2: Bridge the token to the target chain
      this.logger.log(
        `Bridging ${opportunity.token.symbol} from ${opportunity.sourceNetwork} to ${opportunity.targetNetwork}`,
      );

      const bridgeReceipt = await this.wormholeService.bridgeTokens(
        opportunity.sourceNetwork,
        opportunity.targetNetwork,
        tokenAddress,
        opportunity.tradeSize,
      );

      this.logger.log(`Bridge transaction completed: ${bridgeReceipt.hash}`);

      // Step 3: Wait for token to arrive on target chain (simplified)
      // In a real application, you'd implement a proper monitoring system
      this.logger.log('Waiting for tokens to arrive on target chain...');

      // For this example, we'll just wait 30 seconds
      // In production, you'd monitor the target chain for the tokens
      await new Promise((resolve) => setTimeout(resolve, 30000));

      // Step 4: Swap back to stablecoin on target chain if needed
      // (Simplified - in a real app you'd confirm token arrival first)

      this.logger.log('Arbitrage execution completed successfully');
    } catch (error) {
      this.logger.error(
        `Error in manual arbitrage execution: ${error.message}`,
      );
      throw error;
    }
  }
}
