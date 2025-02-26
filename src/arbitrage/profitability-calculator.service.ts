import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ProfitabilityResult {
  isGasFeeProhibitive: boolean;
  isBridgeFeeProhibitive: boolean;
  isSlippageProhibitive: boolean;
  isProfitable: boolean;
  estimatedGasCost: number;
  estimatedBridgeCost: number;
  estimatedSlippage: number;
  estimatedProfitUSD: number;
  estimatedProfitPercentage: number;
}

@Injectable()
export class ProfitabilityCalculatorService {
  private readonly logger = new Logger(ProfitabilityCalculatorService.name);

  constructor(private configService: ConfigService) {}

  calculateProfitability(
    tradeSizeUSD: number,
    sourcePrice: number,
    targetPrice: number,
    gasCostUSD: number,
    bridgeCostUSD: number,
    expectedSlippagePercentage: number,
  ): ProfitabilityResult {
    // Calculate the base profit before costs
    const priceDifferencePercentage =
      ((targetPrice - sourcePrice) / sourcePrice) * 100;
    const grossProfitUSD = (tradeSizeUSD * priceDifferencePercentage) / 100;

    // Calculate slippage impact
    const slippageImpactUSD = (tradeSizeUSD * expectedSlippagePercentage) / 100;

    // Calculate total costs
    const totalCostsUSD = gasCostUSD + bridgeCostUSD + slippageImpactUSD;

    // Calculate net profit
    const netProfitUSD = grossProfitUSD - totalCostsUSD;
    const netProfitPercentage = (netProfitUSD / tradeSizeUSD) * 100;

    // Get minimum profit threshold from config
    const minProfitThreshold = parseFloat(
      this.configService.get<string>('trading.minProfitThreshold') || '0.5',
    );

    // Determine prohibitive factors
    const isGasFeeProhibitive = gasCostUSD > grossProfitUSD * 0.5;
    const isBridgeFeeProhibitive = bridgeCostUSD > grossProfitUSD * 0.3;
    const isSlippageProhibitive = slippageImpactUSD > grossProfitUSD * 0.2;

    // Determine overall profitability
    const isProfitable = netProfitPercentage >= minProfitThreshold;

    return {
      isGasFeeProhibitive,
      isBridgeFeeProhibitive,
      isSlippageProhibitive,
      isProfitable,
      estimatedGasCost: gasCostUSD,
      estimatedBridgeCost: bridgeCostUSD,
      estimatedSlippage: slippageImpactUSD,
      estimatedProfitUSD: netProfitUSD,
      estimatedProfitPercentage: netProfitPercentage,
    };
  }
}
