// Mock data for the dashboard
export const generateChartData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: Math.floor(Math.random() * 1000) + 500,
      trades: Math.floor(Math.random() * 20) + 5,
      successRate: Math.floor(Math.random() * 20) + 80,
    });
  }
  
  return data;
};

export const recentTrades = [
  { 
    id: 1, 
    pair: "ETH/USDT", 
    exchange1: "Binance", 
    exchange2: "Coinbase", 
    profit: 125.45, 
    time: "2 mins ago",
    profitPercent: 1.2,
    isProfit: true,
    executionTime: "0.8s",
    fees: 2.34
  },
  { 
    id: 2, 
    pair: "BTC/USDT", 
    exchange1: "Kraken", 
    exchange2: "Binance", 
    profit: 310.78, 
    time: "5 mins ago",
    profitPercent: 0.8,
    isProfit: true,
    executionTime: "1.2s",
    fees: 5.67
  },
  { 
    id: 3, 
    pair: "SOL/USDT", 
    exchange1: "Coinbase", 
    exchange2: "Kucoin", 
    profit: -42.30, 
    time: "12 mins ago",
    profitPercent: 0.3,
    isProfit: false,
    executionTime: "1.5s",
    fees: 1.89
  },
  { 
    id: 4, 
    pair: "AVAX/USDT", 
    exchange1: "Binance", 
    exchange2: "Huobi", 
    profit: 87.65, 
    time: "18 mins ago",
    profitPercent: 1.5,
    isProfit: true,
    executionTime: "0.9s",
    fees: 3.21
  },
  { 
    id: 5, 
    pair: "MATIC/USDT", 
    exchange1: "Kucoin", 
    exchange2: "Binance", 
    profit: 56.20, 
    time: "25 mins ago",
    profitPercent: 0.9,
    isProfit: true,
    executionTime: "1.1s",
    fees: 2.45
  },
];

export const arbitrageOpportunities = [
  { 
    id: 1, 
    pair: "ETH/USDT", 
    exchange1: "Binance", 
    price1: 3245.78, 
    exchange2: "Coinbase", 
    price2: 3285.45, 
    difference: 39.67, 
    percent: 1.22,
    risk: "low",
    estimatedTime: "0.8s"
  },
  { 
    id: 2, 
    pair: "BTC/USDT", 
    exchange1: "Kraken", 
    price1: 52345.67, 
    exchange2: "Binance", 
    price2: 52765.89, 
    difference: 420.22, 
    percent: 0.80,
    risk: "low",
    estimatedTime: "1.2s"
  },
  { 
    id: 3, 
    pair: "SOL/USDT", 
    exchange1: "Binance", 
    price1: 102.45, 
    exchange2: "Kucoin", 
    price2: 103.78, 
    difference: 1.33, 
    percent: 1.30,
    risk: "medium",
    estimatedTime: "1.5s"
  },
  { 
    id: 4, 
    pair: "AVAX/USDT", 
    exchange1: "Coinbase", 
    price1: 34.56, 
    exchange2: "Huobi", 
    price2: 35.12, 
    difference: 0.56, 
    percent: 1.62,
    risk: "low",
    estimatedTime: "0.9s"
  },
  { 
    id: 5, 
    pair: "MATIC/USDT", 
    exchange1: "Kucoin", 
    price1: 0.85, 
    exchange2: "Binance", 
    price2: 0.86, 
    difference: 0.01, 
    percent: 1.18,
    risk: "high",
    estimatedTime: "1.1s"
  },
];

export const portfolioData = [
  { name: 'BTC', value: 45 },
  { name: 'ETH', value: 30 },
  { name: 'SOL', value: 15 },
  { name: 'Other', value: 10 },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const exchangesList = [
  { id: 1, name: "Binance", type: "CEX", status: "connected", apiHealth: 100 },
  { id: 2, name: "Coinbase", type: "CEX", status: "connected", apiHealth: 98 },
  { id: 3, name: "Kraken", type: "CEX", status: "connected", apiHealth: 100 },
  { id: 4, name: "Kucoin", type: "CEX", status: "disconnected", apiHealth: 0 },
  { id: 5, name: "Huobi", type: "CEX", status: "connected", apiHealth: 92 },
  { id: 6, name: "Uniswap", type: "DEX", status: "connected", apiHealth: 100 },
  { id: 7, name: "PancakeSwap", type: "DEX", status: "connected", apiHealth: 95 },
];

export const aiLogs = [
  { id: 1, message: "Scanning market for arbitrage opportunities...", type: "info", time: "Just now" },
  { id: 2, message: "Found potential ETH/USDT arbitrage on Binance → Coinbase", type: "success", time: "30s ago" },
  { id: 3, message: "Executing trade: Buy ETH on Binance at $3245.78", type: "action", time: "25s ago" },
  { id: 4, message: "Sell ETH on Coinbase at $3285.45", type: "action", time: "24s ago" },
  { id: 5, message: "Trade completed: +$39.67 profit (1.22%)", type: "success", time: "23s ago" },
  { id: 6, message: "Analyzing BTC/USDT price discrepancy on Kraken and Binance", type: "info", time: "15s ago" },
  { id: 7, message: "Warning: MATIC/USDT spread narrowing, monitoring closely", type: "warning", time: "5s ago" },
];