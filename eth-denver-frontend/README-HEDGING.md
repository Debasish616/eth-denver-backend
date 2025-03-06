# Delta-Neutral Hedging Simulation

This document explains the delta-neutral hedging simulation components that have been integrated into the NexusArb frontend. The simulation provides a realistic demonstration of how stablecoins are protected against market volatility through sophisticated hedging strategies.

## Overview

The delta-neutral hedging system showcases how NexusArb maintains stablecoin value when backed by volatile crypto assets. When users convert stablecoins (USDC/USDT) to NUSD, the simulation displays a terminal interface showing:

1. Real-time market condition analysis (bearish, bullish, or sideways markets)
2. Yield optimization strategies with stablecoin allocations
3. Delta-neutral position management
4. Funding rate opportunities and risk mitigation
5. Portfolio metrics and expected APY

## Components

### 1. Hedging Terminal

`HedgingTerminal.tsx` - A modal component that displays the simulated terminal output with a typewriter effect and color-coding for different message types.

```tsx
// Usage example
<HedgingTerminal 
  isVisible={showTerminal}
  fromToken="USDC"
  amount={10000}
  onClose={() => setShowTerminal(false)}
/>
```

### 2. Simulation Utilities

- `simulateHedging.ts` - Generates dynamic terminal output based on market conditions and transaction details
- `simulateSwap.ts` - Simulates the swap transaction for demo purposes

### 3. Demo Button

`DemoHedgingButton.tsx` - A simple button component that triggers the simulation for demonstration purposes.

```tsx
// Usage example
<DemoHedgingButton className="text-sm" />
```

## Integration Points

The hedging terminal simulation has been integrated at two key points:

1. **Swap Page**: 
   - Appears automatically when a user swaps USDC/USDT to NUSD
   - Can be triggered via a demo button when those tokens are selected

2. **Hedging Page**:
   - Available as a demo button in the header area
   - Shows the simulation regardless of wallet connection status

## Market Conditions

The simulation dynamically responds to different market conditions:

### Bearish Market
- Higher allocation to GMX GLP positions (8.2% APY + negative funding)
- Exploitation of negative funding rates (profitable for delta-neutral positions)
- More aggressive short hedging positions

### Bullish Market
- Shift to Perpetual Protocol LP to reduce funding costs
- More defensive position management
- Smaller allocation to Coinbase USDC Earn (lower percentage)

### Sideways Market
- Balanced allocation strategy
- Minimal position adjustments to reduce trading fees
- Normalized funding rate exposure

## Technical Implementation

The simulation uses:
- React hooks for state management
- Framer Motion for animations
- TypeScript for type safety
- Dynamic calculation of yields, APYs, and deltas based on market conditions
- Realistic timing of operations using setTimeout
- Real-time display of progress with a typewriter effect

## Future Enhancements

Potential improvements for the hedging visualization:

1. Integration with real market data APIs
2. More detailed portfolio analytics with charts
3. Historical simulation based on past market conditions
4. Interactive controls to adjust risk parameters
5. Connection to actual hedging strategies when implemented on-chain

---

This simulation serves as a powerful visual demonstration of NexusArb's planned delta-neutral hedging strategy, which differentiates it from other stablecoin protocols that lack robust risk management mechanisms. 