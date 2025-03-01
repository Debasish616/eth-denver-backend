// Mock data for tokens
export const tokens = [
  { id: 1, symbol: "nUSD", name: "Nexus USD", balance: 1250.75, price: 1.00, logo: "💲" },
  { id: 2, symbol: "ETH", name: "Ethereum", balance: 1.45, price: 3245.67, logo: "Ξ" },
  { id: 3, symbol: "BTC", name: "Bitcoin", balance: 0.12, price: 52345.89, logo: "₿" },
  { id: 4, symbol: "SOL", name: "Solana", balance: 25.5, price: 102.45, logo: "◎" },
  { id: 5, symbol: "AVAX", name: "Avalanche", balance: 45.2, price: 34.56, logo: "🔺" },
  { id: 6, symbol: "MATIC", name: "Polygon", balance: 320.8, price: 0.85, logo: "⬡" },
];

// Mock data for chains
export const chains = [
  { id: 1, name: "Ethereum", logo: "Ξ", color: "text-blue-400" },
  { id: 2, name: "Solana", logo: "◎", color: "text-purple-400" },
  { id: 3, name: "Avalanche", logo: "🔺", color: "text-red-400" },
  { id: 4, name: "Polygon", logo: "⬡", color: "text-purple-500" },
  { id: 5, name: "Binance Smart Chain", logo: "⛓️", color: "text-yellow-400" },
  { id: 6, name: "Arbitrum", logo: "🔷", color: "text-blue-500" },
];

// Fixed market data to prevent hydration errors
export const marketData = [
  { id: 1, change: "+2.45%" },
  { id: 2, change: "-1.32%" },
  { id: 3, change: "+3.87%" },
  { id: 4, change: "-0.92%" },
];

// Fixed transaction history to prevent hydration errors
export const transactionHistory = [
  { 
    id: 1,
    type: "swap", 
    from: "ETH", 
    to: "nUSD", 
    amount: "0.5", 
    value: "1,622.84", 
    time: "2 mins ago",
    status: "completed"
  },
  { 
    id: 2,
    type: "bridge", 
    from: "nUSD", 
    to: "nUSD", 
    amount: "500", 
    value: "500", 
    time: "1 hour ago",
    status: "completed",
    fromChain: "Ethereum",
    toChain: "Solana"
  },
  { 
    id: 3,
    type: "swap", 
    from: "BTC", 
    to: "ETH", 
    amount: "0.02", 
    value: "1,046.92", 
    time: "3 hours ago",
    status: "completed"
  },
  { 
    id: 4,
    type: "bridge", 
    from: "SOL", 
    to: "SOL", 
    amount: "15", 
    value: "1,536.75", 
    time: "1 day ago",
    status: "completed",
    fromChain: "Solana",
    toChain: "Ethereum"
  },
];