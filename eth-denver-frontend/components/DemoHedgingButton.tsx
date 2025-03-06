'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal, RefreshCw } from 'lucide-react';
import { HedgingTerminal } from '@/components/HedgingTerminal';
import { simulateStablecoinSwap } from '@/utils/simulateSwap';

interface DemoHedgingButtonProps {
  className?: string;
}

export function DemoHedgingButton({ className }: DemoHedgingButtonProps) {
  const [showTerminal, setShowTerminal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [tokenType, setTokenType] = useState<'USDC' | 'USDT'>('USDC');
  const [amount, setAmount] = useState(10000);
  
  const handleClick = async () => {
    setIsSimulating(true);
    
    // Toggle between USDC and USDT for demo variety
    setTokenType(prev => prev === 'USDC' ? 'USDT' : 'USDC');
    
    // Generate a random amount between 5,000 and 25,000
    const randomAmount = Math.round(5000 + Math.random() * 20000);
    setAmount(randomAmount);
    
    // Simulate a swap
    await simulateStablecoinSwap({
      fromToken: tokenType,
      amount: randomAmount,
      onSuccess: () => {
        setShowTerminal(true);
      }
    });
    
    setIsSimulating(false);
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        onClick={handleClick}
        disabled={isSimulating}
        className={`flex items-center gap-1.5 ${className || ''}`}
      >
        {isSimulating ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Terminal className="h-4 w-4" />
        )}
        {isSimulating ? 'Simulating...' : 'Demo Hedging Terminal'}
      </Button>
      
      <HedgingTerminal 
        isVisible={showTerminal}
        fromToken={tokenType}
        amount={amount}
        onClose={() => setShowTerminal(false)}
      />
    </>
  );
} 