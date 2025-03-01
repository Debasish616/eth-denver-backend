"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Clock,
  DollarSign,
  AlertTriangle,
  Settings,
  ChevronRight,
  Shield,
  Wallet,
  ExternalLink,
  Check,
  X,
  PieChart as PieChartIcon,
  Sliders,
  Percent,
  Activity,
  BarChart2,
  Layers,
  Info,
  CreditCard
} from "lucide-react";
import { 
  ethers, 
  Contract, 
  formatEther, 
  formatUnits, 
  parseEther, 
  parseUnits 
} from "ethers";
import { useWallet } from "@/context/WalletContext";

// Mock data for staking
const stakingData = {
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
const stakingTiers = [
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
const generateHistoricalData = () => {
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

// Mock payment tokens
const paymentTokens = [
  { id: 1, symbol: "USDT", name: "Tether", balance: 5000.75, price: 1.00, logo: "💲" },
  { id: 2, symbol: "USDC", name: "USD Coin", balance: 3250.45, price: 1.00, logo: "💲" },
  { id: 3, symbol: "rUSD", name: "Reserve USD", balance: 1500.25, price: 1.00, logo: "💲" },
  { id: 4, symbol: "ETH", name: "Ethereum", balance: 2.45, price: 3245.67, logo: "Ξ" },
  { id: 5, symbol: "BTC", name: "Bitcoin", balance: 0.18, price: 52345.89, logo: "₿" },
];

// Define interface for unstake requests
interface UnstakeRequest {
  id: number;
  amount: number;
  unlockTime: Date;
  completed: boolean;
  timeRemaining: number;
  canComplete: boolean;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function StakePage() {
  const [userStaked, setUserStaked] = useState(stakingData.userStaked);
  const [pendingRewards, setPendingRewards] = useState(stakingData.pendingRewards);
  const [stakeAmount, setStakeAmount] = useState("1000");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState(stakingTiers[1]);
  const [stakeDuration, setStakeDuration] = useState(30);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [historicalData, setHistoricalData] = useState<{date: string; apy: number; tvl: number; rewards: number}[]>([
    // ... existing mock data ...
  ]);
  const [activeTab, setActiveTab] = useState("stake");
  
  // Buy nUSD state
  const [selectedPaymentToken, setSelectedPaymentToken] = useState(paymentTokens[0]);
  const [paymentAmount, setPaymentAmount] = useState("100");
  const [nusdAmount, setNusdAmount] = useState("100");
  const [isBuying, setIsBuying] = useState(false);
  
  // Use wallet context instead of local state
  const { 
    walletAddress: connectedAccount, 
    isConnecting, 
    connectWallet, 
    signer, 
    getContract 
  } = useWallet();
  
  // Contract and wallet states
  const [nusdContract, setNusdContract] = useState<Contract | null>(null);
  const [sNusdContract, setSNusdContract] = useState<Contract | null>(null);
  const [stakingContract, setStakingContract] = useState<Contract | null>(null);
  const [nusdBalance, setNusdBalance] = useState(0);
  const [sNusdBalance, setSNusdBalance] = useState(0);
  const [unstakeRequests, setUnstakeRequests] = useState<UnstakeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize historical data
  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, []);
  
  // Update nUSD amount based on payment token and amount
  useEffect(() => {
    if (paymentAmount && selectedPaymentToken) {
      // For stablecoins, 1:1 conversion
      if (["USDT", "USDC", "rUSD"].includes(selectedPaymentToken.symbol)) {
        setNusdAmount(paymentAmount);
      } else {
        // For crypto, convert based on price
        const valueInUSD = parseFloat(paymentAmount) * selectedPaymentToken.price;
        setNusdAmount(valueInUSD.toFixed(2));
      }
    }
  }, [paymentAmount, selectedPaymentToken]);
  
  // Simulate rewards accrual
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingRewards(prev => {
        const increase = (userStaked * selectedTier.apy / 100) / (365 * 24 * 60 * 2); // Bi-minute increase
        return prev + increase;
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [userStaked, selectedTier]);
  
  // Initialize contracts when wallet is connected
  useEffect(() => {
    const initializeContracts = async () => {
      if (!connectedAccount || !signer) return;
      
      try {
        // Initialize contracts
        const nusdContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address
        const sNusdContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with actual address
        const stakingContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with actual address
        
        // Get contract instances
        const nusd = getContract(nusdContractAddress, NUSD_ABI);
        setNusdContract(nusd);
        
        const sNusd = getContract(sNusdContractAddress, ERC20_ABI);
        setSNusdContract(sNusd);
        
        const staking = getContract(stakingContractAddress, STAKING_ABI);
        setStakingContract(staking);
        
        // Load balances and requests
        await updateBalancesAndRequests(connectedAccount, nusd, sNusd, staking);
      } catch (error) {
        console.error("Error initializing contracts:", error);
      }
    };
    
    initializeContracts();
  }, [connectedAccount, signer, getContract]);
  
  // Update balances and unstake requests
  const updateBalancesAndRequests = async (
    account: string, 
    nusd: Contract, 
    sNusd: Contract, 
    staking: Contract
  ) => {
    try {
      // Get token balances
      const nusdBal = await nusd.balanceOf(account);
      setNusdBalance(parseFloat(formatEther(nusdBal)));
      
      const sNusdBal = await sNusd.balanceOf(account);
      setSNusdBalance(parseFloat(formatEther(sNusdBal)));
      
      // Get unstake requests
      const requestCount = await staking.getUnstakeRequestCount(account);
      const requestsArray: UnstakeRequest[] = [];
      
      for (let i = 0; i < requestCount.toNumber(); i++) {
        const request = await staking.getUnstakeRequest(account, i);
        requestsArray.push({
          id: i,
          amount: parseFloat(formatEther(request[0])),
          unlockTime: new Date(request[1].toNumber() * 1000),
          completed: request[2],
          // Calculate time remaining
          timeRemaining: Math.max(0, Math.floor((request[1].toNumber() * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
          canComplete: Date.now() >= request[1].toNumber() * 1000 && !request[2]
        });
      }
      
      setUnstakeRequests(requestsArray);
      
    } catch (error: any) {
      console.error("Error updating balances and requests:", error);
    }
  };
  
  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    
    if (!nusdContract || !stakingContract) {
      alert("Contracts not initialized. Please connect your wallet.");
      return;
    }
    
    setIsStaking(true);
    
    try {
      // First approve staking contract to spend NUSD
      const amount = parseEther(stakeAmount);
      const stakingAddress = await stakingContract.getAddress();
      const approveTx = await nusdContract.approve(stakingAddress, amount);
      await approveTx.wait();
      
      // Now stake NUSD
      const stakeTx = await stakingContract.stake(amount);
      await stakeTx.wait();
      
      alert("Successfully staked NUSD!");
      setStakeAmount("");
      
      // Update balances after staking
      if (connectedAccount && nusdContract && sNusdContract && stakingContract) {
        await updateBalancesAndRequests(
          connectedAccount,
          nusdContract,
          sNusdContract,
          stakingContract
        );
      }
    } catch (error: any) {
      console.error("Staking failed:", error);
      alert(`Staking failed: ${error.message || "Unknown error"}`);
    }
    
    setIsStaking(false);
  };
  
  // Handle initiating unstake
  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    
    if (!sNusdContract || !stakingContract) {
      alert("Contracts not initialized. Please connect your wallet.");
      return;
    }
    
    setIsUnstaking(true);
    
    try {
      // First approve staking contract to spend sNUSD
      const amount = parseEther(unstakeAmount);
      const stakingAddress = await stakingContract.getAddress();
      const approveTx = await sNusdContract.approve(stakingAddress, amount);
      await approveTx.wait();
      
      // Now unstake sNUSD
      const unstakeTx = await stakingContract.requestUnstake(amount);
      await unstakeTx.wait();
      
      alert("Successfully requested to unstake sNUSD!");
      setUnstakeAmount("");
      
      // Update balances and unstake requests after unstaking
      if (connectedAccount && nusdContract && sNusdContract && stakingContract) {
        await updateBalancesAndRequests(
          connectedAccount,
          nusdContract,
          sNusdContract,
          stakingContract
        );
      }
    } catch (error: any) {
      console.error("Unstaking failed:", error);
      alert(`Unstaking failed: ${error.message || "Unknown error"}`);
    }
    
    setIsUnstaking(false);
  };
  
  // Handle completing unstake
  const handleCompleteUnstake = async (requestId: number) => {
    if (!stakingContract) {
      alert("Contracts not initialized. Please connect your wallet.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Complete the unstake request
      const completeTx = await stakingContract.completeUnstake(requestId);
      await completeTx.wait();
      
      alert("Successfully completed unstake request!");
      
      // Update balances and unstake requests after completing
      if (connectedAccount && nusdContract && sNusdContract && stakingContract) {
        await updateBalancesAndRequests(
          connectedAccount,
          nusdContract,
          sNusdContract,
          stakingContract
        );
      }
    } catch (error: any) {
      console.error("Completing unstake failed:", error);
      alert(`Completing unstake failed: ${error.message || "Unknown error"}`);
    }
    
    setIsLoading(false);
  };
  
  // Basic ABI for ERC20 tokens
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];
  
  // Basic ABI for NUSD token
  const NUSD_ABI = [
    ...ERC20_ABI,
    "function mint(address to, uint256 amount) returns (bool)",
    "function burn(uint256 amount) returns (bool)"
  ];
  
  // Basic ABI for SNUSDStaking contract
  const STAKING_ABI = [
    "function stake(uint256 amount) returns ()",
    "function initiateUnstake(uint256 amount) returns ()",
    "function completeUnstake(uint256 requestId) returns ()",
    "function getUnstakeRequest(address user, uint256 requestId) view returns (uint256 amount, uint256 unlockTime, bool completed)",
    "function getUnstakeRequestCount(address user) view returns (uint256)"
  ];
  
  // Handle tier selection
  const handleTierSelect = (tier: typeof stakingTiers[number]) => {
    setSelectedTier(tier);
  };
  
  // Handle buying nUSD
  const handleBuyNUSD = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    setIsBuying(true);
    
    // Simulate buying process
    setTimeout(() => {
      // Add the purchased nUSD to available balance
      // In a real app, this would involve a blockchain transaction
      setIsBuying(false);
      setPaymentAmount("");
      setActiveTab("stake");
      // Show success message or update UI accordingly
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Staking & Yield</h1>
              <p className="text-muted-foreground">Earn passive income on your NUSD holdings</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {!connectedAccount ? (
                <Button 
                  variant="default" 
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  Connect Wallet
                </Button>
              ) : (
                <>
                  <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">NUSD Balance</div>
                    <div className="text-xl font-bold">{nusdBalance.toFixed(2)}</div>
                  </div>
                  
                  <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">sNUSD Balance</div>
                    <div className="text-xl font-bold">{sNusdBalance.toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Staked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold">{sNusdBalance.toFixed(2)} sNUSD</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available for Staking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold">{nusdBalance.toFixed(2)} NUSD</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lock Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-400 mr-2" />
                  <span className="text-2xl font-bold">7 Days</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Staking Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="glassmorphism overflow-hidden">
                <CardHeader>
                  <CardTitle>Stake NUSD</CardTitle>
                  <CardDescription>
                    Stake your NUSD to receive sNUSD and earn yield
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="stake" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="stake">Stake</TabsTrigger>
                      <TabsTrigger value="unstake">Unstake</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stake" className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                        <div className="mb-4">
                          <Label htmlFor="stake-amount" className="mb-2 block">Amount to Stake (NUSD)</Label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Input 
                                id="stake-amount"
                                type="text" 
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                className="pr-20"
                                disabled={!connectedAccount}
                              />
                              <Button 
                                variant="ghost" 
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs"
                                onClick={() => setStakeAmount(nusdBalance.toString())}
                                disabled={!connectedAccount}
                              >
                                MAX
                              </Button>
                            </div>
                            <Button 
                              className="bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white"
                              onClick={handleStake}
                              disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > nusdBalance || isStaking || !connectedAccount}
                            >
                              {isStaking ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Zap className="h-4 w-4 mr-2" />
                              )}
                              Stake
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">You Will Receive</span>
                            <span>{parseFloat(stakeAmount || "0").toFixed(2)} sNUSD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exchange Rate</span>
                            <span>1 NUSD = 1 sNUSD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lock Period for Unstaking</span>
                            <span>7 days</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="unstake" className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                        <div className="mb-4">
                          <Label htmlFor="unstake-amount" className="mb-2 block">Amount to Unstake (sNUSD)</Label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Input 
                                id="unstake-amount"
                                type="text" 
                                value={unstakeAmount}
                                onChange={(e) => setUnstakeAmount(e.target.value)}
                                className="pr-20"
                                disabled={!connectedAccount}
                              />
                              <Button 
                                variant="ghost" 
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs"
                                onClick={() => setUnstakeAmount(sNusdBalance.toString())}
                                disabled={!connectedAccount}
                              >
                                MAX
                              </Button>
                            </div>
                            <Button 
                              variant="destructive"
                              onClick={handleUnstake}
                              disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > sNusdBalance || isUnstaking || !connectedAccount}
                            >
                              {isUnstaking ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-2" />
                              )}
                              Initiate Unstake
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Currently Staked</span>
                            <span>{sNusdBalance.toFixed(2)} sNUSD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lock Period</span>
                            <span>7 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">You Will Receive After Lock Period</span>
                            <span>{parseFloat(unstakeAmount || "0").toFixed(2)} NUSD</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/30 flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-yellow-500">
                            Unstaking requires a 7-day lock period before you can claim your NUSD. During this period, you will not earn yield on the unstaked amount.
                          </span>
                        </div>
                      </div>
                      
                      {/* Active Unstake Requests */}
                      {unstakeRequests.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-3">Your Unstake Requests</h3>
                          <div className="space-y-3">
                            {unstakeRequests.map(request => (
                              <Card key={request.id} className={`p-4 ${request.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-background/50'}`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{request.amount.toFixed(2)} sNUSD</div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.completed ? 
                                        'Completed' : 
                                        request.canComplete ? 
                                          'Ready to complete' : 
                                          `Unlocks in ${request.timeRemaining} day(s)`
                                      }
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Unlock time: {request.unlockTime.toLocaleString()}
                                    </div>
                                  </div>
                                  {!request.completed && request.canComplete && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCompleteUnstake(request.id)}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Check className="h-3 w-3 mr-1" />
                                      )}
                                      Complete
                                    </Button>
                                  )}
                                  {request.completed && (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                                      Completed
                                    </Badge>
                                  )}
                                  {!request.completed && !request.canComplete && (
                                    <Badge variant="outline" className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                                      Locked
                                    </Badge>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Additional info about staking */}
              <Card className="glassmorphism overflow-hidden mt-6">
                <CardHeader>
                  <CardTitle>Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Secure Staking</h4>
                      <p className="text-sm text-muted-foreground">
                        Your staked NUSD is secured by the same collateral that backs the NUSD stablecoin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">7-Day Lock Period</h4>
                      <p className="text-sm text-muted-foreground">
                        When you unstake, your NUSD is locked for 7 days before it can be claimed. This helps maintain stability of the protocol.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Activity className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">1:1 Exchange Rate</h4>
                      <p className="text-sm text-muted-foreground">
                        You receive exactly 1 sNUSD for each NUSD you stake, and you can redeem 1 NUSD for each sNUSD when unstaking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div>
              {/* Staking Stats */}
              <Card className="glassmorphism mb-8">
                <CardHeader>
                  <CardTitle>Staking Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">Total Value Locked</div>
                    <div className="font-medium">${stakingData.totalStaked.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">Your Share</div>
                    <div className="font-medium">
                      {((userStaked / stakingData.totalStaked) * 100).toFixed(4)}%
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">Current APY</div>
                    <div className="font-medium text-green-400">{selectedTier.apy}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">Lock Period</div>
                    <div className="font-medium">{selectedTier.lockPeriod} days</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
                    <div className="text-sm text-muted-foreground">Early Withdrawal Fee</div>
                    <div className="font-medium text-red-400">{stakingData.earlyWithdrawalFee}%</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Rewards Calculator */}
              <Card className="glassmorphism mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-blue-400" />
                    Rewards Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Stake Amount (nUSD)</Label>
                    <Input 
                      type="text" 
                      value={stakeAmount || "1000"}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Time Period</Label>
                      <span className="text-sm text-muted-foreground">{stakeDuration} days</span>
                    </div>
                    <Slider 
                      min={1} 
                      max={365} 
                      step={1} 
                      value={[stakeDuration]} 
                      onValueChange={(value) => setStakeDuration(value[0])}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>APY</Label>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gradient-blue-purple">
                        {selectedTier.apy}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({selectedTier.name} Tier)
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-background/50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Daily Rewards</span>
                      <span className="font-medium">
                        ${((parseFloat(stakeAmount || "1000") * selectedTier.apy / 100) / 365).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Weekly Rewards</span>
                      <span className="font-medium">
                        ${((parseFloat(stakeAmount || "1000") * selectedTier.apy / 100) / 52).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Rewards</span>
                      <span className="font-medium">
                        ${((parseFloat(stakeAmount || "1000") * selectedTier.apy / 100) / 12).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-border/30">
                      <span className="text-sm font-medium">Estimated Earnings</span>
                      <span className="font-bold text-green-400">
                        ${((parseFloat(stakeAmount || "1000") * selectedTier.apy / 100) * (stakeDuration / 365)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* FAQ */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-purple-400" />
                    Staking FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      What is nUSD staking?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      Staking nUSD allows you to earn passive income on your holdings. By locking your tokens, you contribute to the protocol's stability and earn rewards in return.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      How are rewards calculated?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      Rewards are calculated based on your staked amount, the APY of your selected tier, and the duration of staking. Rewards accrue in real-time.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      What happens if I unstake early?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      If you unstake before your lock period ends, you'll incur an early withdrawal fee of {stakingData.earlyWithdrawalFee}% on the unstaked amount. This fee helps maintain protocol stability.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      How often can I claim rewards?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      You can claim your rewards at any time. There's no minimum threshold or waiting period for claiming accrued rewards.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      What are the different staking tiers?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      We offer three tiers: Silver (no lock, 12.5% APY), Gold (7-day lock, 18.5% APY), and Platinum (30-day lock, 24% APY). Higher tiers require more nUSD but offer better rewards.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-primary" />
                      How can I buy nUSD?
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5">
                      You can buy nUSD directly on our platform using USDT, USDC, rUSD, ETH, or BTC. Simply go to the "Buy nUSD" tab, select your preferred payment method, and enter the amount you wish to purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}