/**
 * Utility function to simulate a swap from stablecoins (USDC/USDT) to NUSD
 * This is used for testing and demonstration purposes when we want to show
 * the hedging terminal without actually performing blockchain transactions
 */

interface SimulateSwapOptions {
  fromToken: 'USDC' | 'USDT';
  amount: number;
  onSuccess?: () => void;
}

export function simulateStablecoinSwap(options: SimulateSwapOptions): Promise<boolean> {
  const { fromToken, amount, onSuccess } = options;
  
  // Simulate network delay and processing time
  return new Promise((resolve) => {
    console.log(`Simulating swap of ${amount} ${fromToken} to NUSD...`);
    
    // Random time between 1.5 and 3 seconds to simulate network latency
    const processingTime = 1500 + Math.random() * 1500;
    
    setTimeout(() => {
      console.log(`Swap of ${amount} ${fromToken} to NUSD completed successfully!`);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      resolve(true);
    }, processingTime);
  });
} 