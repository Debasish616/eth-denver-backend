// Mock data for staking
export const stakingData = {
  apy: 18.5,
  totalStaked: 2450000,
  userStaked: 12500,
  availableBalance: 4500,
  pendingRewards: 345.75,
  totalRewards: 1250.45,
  lockPeriod: 7, // days
  earlyWithdrawalFee: 5, // percent
  minStake: 100,
  maxStake: 100000,
};

// Mock staking tiers
export const stakingTiers = [
  { 
    id: 1, 
    name: "Silver", 
    minStake: 100, 
    apy: 12.5, 
    lockPeriod: 0, 
    benefits: ["No lock-up period", "Basic rewards", "Standard support"]
  },
  { 
    id: 2, 
    name: "Gold", 
    minStake: 5000, 
    apy: 18.5, 
    lockPeriod: 7, 
    benefits: ["7-day lock period", "Higher APY", "Priority support", "Governance voting"]
  },
  { 
    id: 3, 
    name: "Platinum", 
    minStake: 25000, 
    apy: 24.0, 
    lockPeriod: 30, 
    benefits: ["30-day lock period", "Premium APY", "VIP support", "Governance voting", "Early access to new features"]
  },
];

// Generate mock historical data
export const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      apy: 16 + Math.random() * 5,
      tvl: 2000000 + (Math.random() * 1000000 - 500000),
      rewards: 50 + (i * 10) + (Math.random() * 20 - 10),
    });
  }
  
  return data;
};