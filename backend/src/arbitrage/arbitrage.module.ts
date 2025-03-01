import { Module } from '@nestjs/common';
import { ArbitrageService } from './arbitrage.service';
import { OpportunityFinderService } from './opportunity-finder.service';
import { ProfitabilityCalculatorService } from './profitability-calculator.service';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { BridgesModule } from '../bridges/bridges.module';
import { BotsModule } from '../bots/bots.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ArbitrageController } from './arbitrage.controller';

@Module({
  imports: [BlockchainModule, ExchangesModule, BridgesModule, BotsModule],
  providers: [
    ArbitrageService,
    OpportunityFinderService,
    ProfitabilityCalculatorService,
  ],
  controllers: [ArbitrageController],
  exports: [ArbitrageService],
})
export class ArbitrageModule {}
