/**
 * Utility function to generate simulated terminal output for delta-neutral hedging
 * operations when converting stablecoins (USDC/USDT) to NUSD
 */

type MarketCondition = 'BEARISH' | 'BULLISH' | 'SIDEWAYS';

interface SimulationOptions {
  fromToken: 'USDC' | 'USDT';
  amount: number;
  marketCondition?: MarketCondition;
}

export function simulateHedgingTerminal(options: SimulationOptions): string[] {
  const { fromToken, amount, marketCondition = getRandomMarketCondition() } = options;
  
  // Current timestamp and formatted time
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0] + ' ' + 
                   now.toTimeString().split(' ')[0] + ' UTC';
  
  // Market metrics based on condition
  const marketMetrics = getMarketMetrics(marketCondition);
  
  // Calculate allocated amounts
  const coinbaseAmount = Math.round(amount * 0.4); // 40% to Coinbase
  const gmxAmount = Math.round(amount * 0.35);     // 35% to GMX
  const dydxAmount = Math.round(amount * 0.25);    // 25% to dYdX or Perpetual

  // Generate lines of terminal output
  const output: string[] = [
    `[NexusArb] Delta-Neutral Hedging Engine v1.0.3`,
    `------------------------------------------------`,
    `Processing ${fromToken} to NUSD conversion: ${amount.toLocaleString()} ${fromToken}`,
    `${timestamp}`,
    ``,
    `[INFO] Initiating delta-neutral hedging for stablecoin conversion...`,
    `[INFO] Connected to Ethereum node: https://rpc.sepolia.io`,
    `[INFO] Gas price: ${10 + Math.floor(Math.random() * 5)} gwei`,
    ``,
    `[ANALYSIS] ${formatTime(now)} - Market condition assessment...`,
    `[ANALYSIS] ${formatTime(addSeconds(now, 1))} - BTC 24h change: ${marketMetrics.btcChange}% | ETH 24h change: ${marketMetrics.ethChange}% | Market sentiment: ${marketCondition}`,
    `[ANALYSIS] ${formatTime(addSeconds(now, 1))} - Volatility index: ${marketMetrics.volatility.level} (${marketMetrics.volatility.value}) | Funding rates: ${marketMetrics.fundingRates}`,
    ``,
    `[STRATEGY] ${formatTime(addSeconds(now, 2))} - Optimizing stablecoin yield allocation strategy...`,
    `[STRATEGY] ${formatTime(addSeconds(now, 3))} - Recommended allocation:`,
    `  • ${marketMetrics.allocation.coinbase}% → Coinbase ${fromToken} Earn (4.0% APY)`,
    `  • ${marketMetrics.allocation.gmx}% → GMX GLP (${marketMetrics.allocation.gmxYield}% APY${marketMetrics.allocation.gmxExtra})`,
    `  • ${marketMetrics.allocation.dydx}% → ${marketMetrics.allocation.dydxVenue} (${marketMetrics.allocation.dydxYield}% APY${marketMetrics.allocation.dydxExtra})`,
    ``,
    `[EXECUTION] ${formatTime(addSeconds(now, 4))} - Initiating yield optimization for ${amount.toLocaleString()} ${fromToken}...`,
    `[EXECUTION] ${formatTime(addSeconds(now, 7))} - Allocating ${coinbaseAmount.toLocaleString()} ${fromToken} to Coinbase Earn (4.0% APY)`,
    `[EXECUTION] ${formatTime(addSeconds(now, 10))} - Allocating ${gmxAmount.toLocaleString()} ${fromToken} to GMX GLP (${marketMetrics.allocation.gmxYield}% APY)`,
    `[EXECUTION] ${formatTime(addSeconds(now, 13))} - Allocating ${dydxAmount.toLocaleString()} ${fromToken} to ${marketMetrics.allocation.dydxVenue} (${marketMetrics.allocation.dydxYield}% APY)`,
  ];

  // Add condition-specific execution steps
  if (marketCondition === 'BEARISH') {
    output.push(
      `[EXECUTION] ${formatTime(addSeconds(now, 16))} - Funding rate arbitrage: ${marketMetrics.fundingRateValue} on ETH/USD (${marketMetrics.allocation.dydxVenue}) → Estimated daily yield: +${Math.abs(parseFloat(marketMetrics.fundingRateValue)) * 3}%`,
      `[EXECUTION] ${formatTime(addSeconds(now, 19))} - Setting up protective short positions to maintain delta neutrality`,
    );
  } else if (marketCondition === 'BULLISH') {
    output.push(
      `[EXECUTION] ${formatTime(addSeconds(now, 16))} - Adjusting position to mitigate positive funding costs: ${marketMetrics.fundingRateValue} on ETH/USD`,
      `[EXECUTION] ${formatTime(addSeconds(now, 19))} - Implementing additional hedging to maintain delta neutrality in bullish market`,
    );
  } else {
    output.push(
      `[EXECUTION] ${formatTime(addSeconds(now, 16))} - Balanced funding rate exposure: ${marketMetrics.fundingRateValue} on ETH/USD`,
      `[EXECUTION] ${formatTime(addSeconds(now, 19))} - Optimizing for sideways market conditions with minimal position adjustments`,
    );
  }

  // Add portfolio and summary information
  output.push(
    ``,
    `[PORTFOLIO] ${formatTime(addSeconds(now, 21))} - Portfolio delta after allocation: ${getRandomDelta()} (near-perfect neutrality)`,
    `[PORTFOLIO] ${formatTime(addSeconds(now, 21))} - Expected yield from current positions: ${(marketMetrics.expectedYield).toFixed(2)}% APY`,
    ``,
    `[STATUS] Conversion of ${amount.toLocaleString()} ${fromToken} to ${amount.toLocaleString()} NUSD complete`,
    `[STATUS] Delta-neutral hedging active and protecting your NUSD value`,
    `[STATUS] Estimated daily yield from this operation: +$${(amount * marketMetrics.expectedYield / 365 / 100).toFixed(2)}`
  );

  return output;
}

// Helper functions
function getRandomMarketCondition(): MarketCondition {
  const conditions: MarketCondition[] = ['BEARISH', 'BULLISH', 'SIDEWAYS'];
  return conditions[Math.floor(Math.random() * conditions.length)];
}

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

function addSeconds(date: Date, seconds: number): Date {
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() + seconds);
  return newDate;
}

function getRandomDelta(): string {
  const sign = Math.random() > 0.5 ? '+' : '-';
  return sign + (0.001 + Math.random() * 0.008).toFixed(3);
}

function getMarketMetrics(condition: MarketCondition) {
  switch (condition) {
    case 'BEARISH':
      return {
        btcChange: (-2 - Math.random() * 3).toFixed(1),
        ethChange: (-3 - Math.random() * 2).toFixed(1),
        volatility: { level: 'HIGH', value: (30 + Math.random() * 5).toFixed(1) },
        fundingRates: 'NEGATIVE on most venues',
        fundingRateValue: (-0.01 - Math.random() * 0.01).toFixed(3) + '%',
        allocation: {
          coinbase: 40,
          gmx: 35,
          dydx: 25,
          gmxYield: (7.5 + Math.random() * 1.5).toFixed(1),
          gmxExtra: ' + negative funding',
          dydxVenue: 'dYdX perpetual LP',
          dydxYield: (7 + Math.random() * 1).toFixed(1),
          dydxExtra: ''
        },
        expectedYield: 5.7 + Math.random() * 0.5
      };
    
    case 'BULLISH':
      return {
        btcChange: (1 + Math.random() * 3).toFixed(1),
        ethChange: (0.5 + Math.random() * 3).toFixed(1),
        volatility: { level: 'MEDIUM-HIGH', value: (25 + Math.random() * 5).toFixed(1) },
        fundingRates: 'POSITIVE on most venues',
        fundingRateValue: (0.01 + Math.random() * 0.01).toFixed(3) + '%',
        allocation: {
          coinbase: 35,
          gmx: 40,
          dydx: 25,
          gmxYield: (6.5 + Math.random() * 1).toFixed(1),
          gmxExtra: '',
          dydxVenue: 'Perpetual Protocol LP',
          dydxYield: (6 + Math.random() * 1).toFixed(1),
          dydxExtra: ' + reduced funding cost'
        },
        expectedYield: 5.4 + Math.random() * 0.4
      };
    
    default: // SIDEWAYS
      return {
        btcChange: (-1 + Math.random() * 2).toFixed(1),
        ethChange: (-1.5 + Math.random() * 3).toFixed(1),
        volatility: { level: 'MEDIUM', value: (20 + Math.random() * 5).toFixed(1) },
        fundingRates: 'NORMALIZING',
        fundingRateValue: (-0.005 + Math.random() * 0.01).toFixed(3) + '%',
        allocation: {
          coinbase: 40,
          gmx: 35,
          dydx: 25,
          gmxYield: (7 + Math.random() * 1).toFixed(1),
          gmxExtra: '',
          dydxVenue: 'dYdX perpetual LP',
          dydxYield: (7 + Math.random() * 0.5).toFixed(1),
          dydxExtra: ''
        },
        expectedYield: 5.5 + Math.random() * 0.5
      };
  }
} 