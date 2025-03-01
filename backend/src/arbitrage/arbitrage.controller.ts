import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ArbitrageService } from './arbitrage.service';
import { OpportunityFinderService } from './opportunity-finder.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('arbitrage')
export class ArbitrageController {
  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly opportunityFinder: OpportunityFinderService,
  ) {}

  @Get('opportunities')
  @UseGuards(ApiKeyGuard)
  async getOpportunities() {
    return this.opportunityFinder.findArbitrageOpportunities();
  }

  @Post('execute/:id')
  @UseGuards(ApiKeyGuard)
  async executeArbitrage(@Param('id') id: string) {
    // This would be implemented to manually trigger an arbitrage opportunity
    // For security reasons, this would need additional validation
    return { success: true, message: 'Arbitrage execution triggered' };
  }

  @Get('status')
  @UseGuards(ApiKeyGuard)
  async getStatus() {
    // Return current status of the arbitrage bot
    return {
      status: 'active',
      lastScan: new Date().toISOString(),
      isExecuting: false,
      // Additional stats would be added here
    };
  }
}
