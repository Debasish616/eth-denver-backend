"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletContext';

// Simulated exchanges for hedging operations
const EXCHANGES = ['Binance', 'dYdX', 'Aave', 'GMX', 'Perpetual Protocol'];

// Hedging position type
export type HedgingPosition = {
  id: string;
  timestamp: number;
  exchange: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  size: number;
  collateral: number;
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  hedgingRatio: number;
  status: 'ACTIVE' | 'CLOSED' | 'REBALANCING';
  collateralToken: string;
};

type HedgingContextType = {
  isHedgingActive: boolean;
  hedgingPositions: HedgingPosition[];
  totalHedgedValue: number;
  hedgingRatio: number;
  rebalancingFrequency: number;
  netDelta: number;
  averageExecutionTime: number;
  hedgingEvents: any[];
  profitLoss: number;
  initializeHedging: (amount: number, token: string) => Promise<void>;
  rebalancePositions: () => Promise<void>;
  closeHedgingPosition: (id: string) => Promise<void>;
  getHedgingMetrics: () => { [key: string]: number };
};

const HedgingContext = createContext<HedgingContextType>({
  isHedgingActive: false,
  hedgingPositions: [],
  totalHedgedValue: 0,
  hedgingRatio: 0,
  rebalancingFrequency: 0,
  netDelta: 0,
  averageExecutionTime: 0,
  hedgingEvents: [],
  profitLoss: 0,
  initializeHedging: async () => {},
  rebalancePositions: async () => {},
  closeHedgingPosition: async () => {},
  getHedgingMetrics: () => ({}),
});

// Price simulation data
const PRICE_SIMULATION = {
  USDC: 1,
  USDT: 1,
  WETH: 3400 + Math.random() * 200,
  WBTC: 64000 + Math.random() * 2000,
};

// Mock token prices for demonstration
const TOKEN_PRICES = {
  USDC: 1,
  USDT: 1,
  WETH: 3500,
  WBTC: 65000,
  DAI: 1,
  NUSD: 1,
};

export const HedgingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress } = useWallet();
  const [isHedgingActive, setIsHedgingActive] = useState(true);
  const [hedgingPositions, setHedgingPositions] = useState<HedgingPosition[]>([]);
  const [totalHedgedValue, setTotalHedgedValue] = useState(0);
  const [hedgingRatio, setHedgingRatio] = useState(0.97); // 97% hedged
  const [rebalancingFrequency, setRebalancingFrequency] = useState(15); // minutes
  const [netDelta, setNetDelta] = useState(0.05); // slightly positive delta
  const [averageExecutionTime, setAverageExecutionTime] = useState(0.73); // seconds
  const [hedgingEvents, setHedgingEvents] = useState<any[]>([]);
  const [profitLoss, setProfitLoss] = useState(0);
  
  // Mock data for existing positions
  useEffect(() => {
    if (walletAddress) {
      // Simulate existing hedging positions
      const mockPositions: HedgingPosition[] = [
        {
          id: '0x7a12',
          timestamp: Date.now() - 3600000 * 24,
          exchange: 'dYdX',
          pair: 'ETH-USD',
          direction: 'SHORT',
          size: 15000,
          collateral: 5000,
          leverage: 3,
          entryPrice: 3450,
          currentPrice: 3480,
          pnl: -130.43,
          hedgingRatio: 0.98,
          status: 'ACTIVE',
          collateralToken: 'USDC'
        },
        {
          id: '0x8b34',
          timestamp: Date.now() - 1800000,
          exchange: 'GMX',
          pair: 'BTC-USD',
          direction: 'SHORT',
          size: 25000,
          collateral: 8333.33,
          leverage: 3,
          entryPrice: 64500,
          currentPrice: 64200,
          pnl: 243.21,
          hedgingRatio: 0.97,
          status: 'ACTIVE',
          collateralToken: 'USDC'
        },
        {
          id: '0x9c56',
          timestamp: Date.now() - 7200000,
          exchange: 'Perpetual Protocol',
          pair: 'ETH-USD',
          direction: 'LONG',
          size: 10000,
          collateral: 5000,
          leverage: 2,
          entryPrice: 3420,
          currentPrice: 3480,
          pnl: 175.44,
          hedgingRatio: 0.99,
          status: 'REBALANCING',
          collateralToken: 'USDC'
        }
      ];
      
      setHedgingPositions(mockPositions);
      
      // Calculate total hedged value
      const total = mockPositions.reduce((sum, pos) => sum + pos.size, 0);
      setTotalHedgedValue(total);
      
      // Simulate hedging events
      const mockEvents = [
        { timestamp: Date.now() - 3600000 * 24, type: 'OPEN', exchange: 'dYdX', pair: 'ETH-USD', direction: 'SHORT', size: 15000 },
        { timestamp: Date.now() - 3600000 * 23, type: 'REBALANCE', delta: 0.03, executionTime: 0.68 },
        { timestamp: Date.now() - 3600000 * 18, type: 'OPEN', exchange: 'GMX', pair: 'BTC-USD', direction: 'SHORT', size: 25000 },
        { timestamp: Date.now() - 3600000 * 12, type: 'OPEN', exchange: 'Perpetual Protocol', pair: 'ETH-USD', direction: 'LONG', size: 10000 },
        { timestamp: Date.now() - 3600000 * 6, type: 'REBALANCE', delta: 0.05, executionTime: 0.72 },
        { timestamp: Date.now() - 3600000 * 1, type: 'REBALANCE', delta: 0.02, executionTime: 0.81 },
      ];
      
      setHedgingEvents(mockEvents);
      
      // Calculate PnL
      const pnl = mockPositions.reduce((total, pos) => total + pos.pnl, 0);
      setProfitLoss(pnl);
    }
  }, [walletAddress]);
  
  // Simulate rebalancing at intervals
  useEffect(() => {
    if (!isHedgingActive) return;
    
    const interval = setInterval(() => {
      // Simulate price fluctuations
      const updatedPositions = hedgingPositions.map(pos => {
        // Random price movement
        const priceChange = (Math.random() - 0.5) * 20;
        const newPrice = pos.currentPrice + priceChange;
        
        // Calculate new PnL
        const priceMove = newPrice - pos.entryPrice;
        const pnlDirection = pos.direction === 'LONG' ? 1 : -1;
        const newPnl = (priceMove / pos.entryPrice) * pos.size * pnlDirection;
        
        return {
          ...pos,
          currentPrice: newPrice,
          pnl: parseFloat(newPnl.toFixed(2)),
          status: Math.random() > 0.9 ? 'REBALANCING' : pos.status
        };
      });
      
      setHedgingPositions(updatedPositions);
      
      // Update total PnL
      const pnl = updatedPositions.reduce((total, pos) => total + pos.pnl, 0);
      setProfitLoss(parseFloat(pnl.toFixed(2)));
      
      // Simulate delta changes
      setNetDelta(parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)));
      
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [isHedgingActive, hedgingPositions]);
  
  // Initialize new hedging positions
  const initializeHedging = async (amount: number, token: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const tokenPrice = TOKEN_PRICES[token as keyof typeof TOKEN_PRICES] || 1;
    const valueInUsd = amount * tokenPrice;
    
    // Create new positions that are delta neutral
    const newPositions: HedgingPosition[] = [];
    
    // Short position to hedge 
    if (token !== 'USDC' && token !== 'USDT' && token !== 'DAI') {
      newPositions.push({
        id: `0x${Math.floor(Math.random() * 10000).toString(16)}`,
        timestamp: Date.now(),
        exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
        pair: `${token}-USD`,
        direction: 'SHORT',
        size: valueInUsd,
        collateral: valueInUsd / 3,
        leverage: 3,
        entryPrice: tokenPrice,
        currentPrice: tokenPrice,
        pnl: 0,
        hedgingRatio: hedgingRatio,
        status: 'ACTIVE',
        collateralToken: 'USDC'
      });
    }
    
    // Add some counterbalancing positions for delta neutrality
    if (valueInUsd > 5000) {
      newPositions.push({
        id: `0x${Math.floor(Math.random() * 10000).toString(16)}`,
        timestamp: Date.now(),
        exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
        pair: 'ETH-USD',
        direction: 'LONG',
        size: valueInUsd * 0.2,
        collateral: valueInUsd * 0.1,
        leverage: 2,
        entryPrice: PRICE_SIMULATION.WETH,
        currentPrice: PRICE_SIMULATION.WETH,
        pnl: 0,
        hedgingRatio: hedgingRatio,
        status: 'ACTIVE',
        collateralToken: 'USDC'
      });
    }
    
    // Record the hedging event
    const newEvent = {
      timestamp: Date.now(),
      type: 'HEDGE',
      token,
      amount,
      valueInUsd,
      positions: newPositions.map(p => ({
        exchange: p.exchange,
        pair: p.pair,
        direction: p.direction,
        size: p.size
      }))
    };
    
    setHedgingPositions(prev => [...prev, ...newPositions]);
    setHedgingEvents(prev => [newEvent, ...prev]);
    setTotalHedgedValue(prev => prev + valueInUsd);
    
    // Simulate average execution time changes
    setAverageExecutionTime(parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)));
    
    return;
  };
  
  // Rebalance positions
  const rebalancePositions = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update positions to show rebalancing
    const updatedPositions = hedgingPositions.map(pos => ({
      ...pos,
      status: 'REBALANCING' as const
    }));
    
    setHedgingPositions(updatedPositions);
    
    // Simulate rebalancing completion
    setTimeout(() => {
      const rebalancedPositions = updatedPositions.map(pos => {
        // Adjust hedging ratio slightly
        const newRatio = Math.min(0.99, Math.max(0.95, pos.hedgingRatio + (Math.random() * 0.02 - 0.01)));
        
        // Create small price adjustments
        const priceChange = (Math.random() - 0.5) * 10;
        const newPrice = pos.currentPrice + priceChange;
        
        // Recalculate PnL
        const priceMove = newPrice - pos.entryPrice;
        const pnlDirection = pos.direction === 'LONG' ? 1 : -1;
        const newPnl = (priceMove / pos.entryPrice) * pos.size * pnlDirection;
        
        return {
          ...pos,
          hedgingRatio: parseFloat(newRatio.toFixed(2)),
          currentPrice: newPrice,
          pnl: parseFloat(newPnl.toFixed(2)),
          status: 'ACTIVE' as const
        };
      });
      
      setHedgingPositions(rebalancedPositions);
      
      // Add rebalancing event
      const newEvent = {
        timestamp: Date.now(),
        type: 'REBALANCE',
        delta: parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)),
        executionTime: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2))
      };
      
      setHedgingEvents(prev => [newEvent, ...prev]);
      
      // Update net delta
      setNetDelta(parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)));
      
      // Update average execution time
      setAverageExecutionTime(prev => parseFloat(((prev + newEvent.executionTime) / 2).toFixed(2)));
      
    }, 3000);
    
    return;
  };
  
  // Close a hedging position
  const closeHedgingPosition = async (id: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the position
    const position = hedgingPositions.find(p => p.id === id);
    if (!position) return;
    
    // Remove the position
    setHedgingPositions(prev => prev.filter(p => p.id !== id));
    
    // Adjust total hedged value
    setTotalHedgedValue(prev => prev - position.size);
    
    // Record closing event
    const newEvent = {
      timestamp: Date.now(),
      type: 'CLOSE',
      position: {
        exchange: position.exchange,
        pair: position.pair,
        direction: position.direction,
        size: position.size,
        pnl: position.pnl
      }
    };
    
    setHedgingEvents(prev => [newEvent, ...prev]);
    
    return;
  };
  
  // Get hedging metrics for dashboard
  const getHedgingMetrics = () => {
    const longPositions = hedgingPositions.filter(p => p.direction === 'LONG');
    const shortPositions = hedgingPositions.filter(p => p.direction === 'SHORT');
    
    const longValue = longPositions.reduce((sum, pos) => sum + pos.size, 0);
    const shortValue = shortPositions.reduce((sum, pos) => sum + pos.size, 0);
    
    return {
      longValue,
      shortValue,
      netValue: longValue - shortValue,
      hedgingRatio,
      netDelta,
      averageExecutionTime,
      positionCount: hedgingPositions.length,
      profitLoss,
      rebalancingFrequency
    };
  };
  
  const value = {
    isHedgingActive,
    hedgingPositions,
    totalHedgedValue,
    hedgingRatio,
    rebalancingFrequency,
    netDelta,
    averageExecutionTime,
    hedgingEvents,
    profitLoss,
    initializeHedging,
    rebalancePositions,
    closeHedgingPosition,
    getHedgingMetrics
  };
  
  return (
    <HedgingContext.Provider value={value}>
      {children}
    </HedgingContext.Provider>
  );
};

export const useHedging = () => useContext(HedgingContext); 