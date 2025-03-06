"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign, 
  Zap, 
  Timer,
  BarChart, 
  ArrowLeftRight,
  Check,
  Clock,
  Repeat,
  ExternalLink,
  BarChart3,
  ChevronRight,
  AlertCircle,
  Wallet,
  Percent
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define TypeScript interfaces
interface ArbitrageOpportunity {
  id: string;
  type: "funding" | "price" | "liquidation";
  source: string;
  destination: string;
  asset: string;
  amount: number;
  profit: number;
  status: "discovered" | "executing" | "executed";
  timestamp: number;
  executionTime: string;
}

interface ArbitrageTypeInfo {
  type: "funding" | "price" | "liquidation";
  description: string;
  color: string;
  bgColor: string;
}

interface FundingRateInfo {
  [venue: string]: {
    [asset: string]: number;
  };
}

// Mock arbitrage opportunities
const initialArbitrageOpportunities: ArbitrageOpportunity[] = [
  {
    id: "arb-1",
    type: "funding",
    source: "GMX",
    destination: "dYdX",
    asset: "ETH",
    amount: 1.25,
    profit: 28.74,
    status: "executed",
    timestamp: Date.now() - 1000 * 60 * 2,
    executionTime: "1.3s"
  },
  {
    id: "arb-2",
    type: "price",
    source: "dYdX",
    destination: "Perpetual",
    asset: "BTC",
    amount: 0.05,
    profit: 14.52,
    status: "executed",
    timestamp: Date.now() - 1000 * 60 * 8,
    executionTime: "0.8s"
  },
  {
    id: "arb-3",
    type: "funding",
    source: "Perpetual",
    destination: "GMX",
    asset: "ETH",
    amount: 2.8,
    profit: 41.23,
    status: "executed",
    timestamp: Date.now() - 1000 * 60 * 15,
    executionTime: "1.1s"
  }
];

// Mock funding rates for different venues
const fundingRates: FundingRateInfo = {
  GMX: { ETH: 0.0021, BTC: 0.0018, ARB: -0.0042, SOL: 0.0034 },
  dYdX: { ETH: -0.0014, BTC: -0.0008, ARB: 0.0027, SOL: -0.0021 },
  Perpetual: { ETH: 0.0032, BTC: 0.0022, ARB: -0.0009, SOL: 0.0018 }
};

// Arbitrage types and their descriptions
const arbitrageTypes: ArbitrageTypeInfo[] = [
  { 
    type: "funding", 
    description: "Exploits funding rate differentials between venues, transferring positions to pay lower or earn more funding", 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    type: "price", 
    description: "Capitalizes on price differences for the same asset across different exchanges", 
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  { 
    type: "liquidation", 
    description: "Takes advantage of temporary market inefficiencies during large liquidation events", 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10" 
  }
];

export default function AutomatedArbitrage() {
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>(initialArbitrageOpportunities);
  const [totalProfit, setTotalProfit] = useState(84.49);
  const [dailyProfit, setDailyProfit] = useState(84.49);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState("All Assets");
  const [activeTab, setActiveTab] = useState("opportunities");
  
  // Auto-generate new arbitrage opportunities
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !isSearching) {
        findArbitrageOpportunities();
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isSearching, arbitrageOpportunities]);
  
  const findArbitrageOpportunities = useCallback(() => {
    setIsSearching(true);
    setSearchProgress(0);
    
    // Simulate search progress
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Decide if we found an opportunity
          const foundOpportunity = Math.random() > 0.3;
          
          if (foundOpportunity) {
            generateNewOpportunity();
          } else {
            setTimeout(() => setIsSearching(false), 500);
          }
          
          return 100;
        }
        return prev + (Math.random() * 8 + 2);
      });
    }, 200);
  }, []);
  
  const generateNewOpportunity = useCallback(() => {
    const assets = ["ETH", "BTC", "ARB", "SOL"];
    const venues = ["GMX", "dYdX", "Perpetual"];
    const types: Array<"funding" | "price" | "liquidation"> = ["funding", "price", "liquidation"];
    
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const sourceIndex = Math.floor(Math.random() * venues.length);
    let destinationIndex = Math.floor(Math.random() * venues.length);
    while (destinationIndex === sourceIndex) {
      destinationIndex = Math.floor(Math.random() * venues.length);
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Generate realistic amounts based on the asset
    let amount, profit;
    if (asset === "ETH") {
      amount = +(Math.random() * 4 + 0.5).toFixed(2);
      profit = +(Math.random() * 30 + 10).toFixed(2);
    } else if (asset === "BTC") {
      amount = +(Math.random() * 0.2 + 0.01).toFixed(3);
      profit = +(Math.random() * 25 + 5).toFixed(2);
    } else {
      amount = +(Math.random() * 100 + 20).toFixed(0);
      profit = +(Math.random() * 15 + 2).toFixed(2);
    }
    
    const executionTime = +(Math.random() * 1.5 + 0.5).toFixed(1);
    
    const newOpportunity: ArbitrageOpportunity = {
      id: `arb-${Date.now()}`,
      type,
      source: venues[sourceIndex],
      destination: venues[destinationIndex],
      asset,
      amount,
      profit,
      status: "discovered",
      timestamp: Date.now(),
      executionTime: `${executionTime}s`
    };
    
    // Add the new opportunity and update totals
    setArbitrageOpportunities(prev => [newOpportunity, ...prev.slice(0, 9)]);
    
    // Update total profit (using current state would be stale due to closure)
    setTotalProfit(prev => +(prev + profit).toFixed(2));
    setDailyProfit(prev => +(prev + profit).toFixed(2));
    
    // After a slight delay, mark as executing
    setTimeout(() => {
      setArbitrageOpportunities(prev => 
        prev.map(opp => 
          opp.id === newOpportunity.id 
            ? { ...opp, status: "executing" } 
            : opp
        )
      );
      
      // After another delay, mark as executed
      setTimeout(() => {
        setArbitrageOpportunities(prev => 
          prev.map(opp => 
            opp.id === newOpportunity.id 
              ? { ...opp, status: "executed" } 
              : opp
          )
        );
        setIsSearching(false);
      }, executionTime * 1000);
    }, 800);
  }, []);
  
  const getOpportunityStatusColor = (status: "discovered" | "executing" | "executed"): string => {
    switch(status) {
      case "discovered": return "text-yellow-400";
      case "executing": return "text-blue-400";
      case "executed": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };
  
  const getArbitrageTypeInfo = (type: "funding" | "price" | "liquidation"): ArbitrageTypeInfo => {
    return arbitrageTypes.find(t => t.type === type) || arbitrageTypes[0];
  };
  
  const filteredOpportunities = selectedAsset === "All Assets" 
    ? arbitrageOpportunities 
    : arbitrageOpportunities.filter(opp => opp.asset === selectedAsset);
  
  return (
    <Card className="w-full mb-8 glassmorphism">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-teal-400" />
              Automated Arbitrage Engine
            </CardTitle>
            <CardDescription>
              Real-time arbitrage discovery and execution for enhanced yields
            </CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-teal-500/10 text-teal-500 border-teal-500/20">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse"></div>
              Active
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-teal-400" />
                Total Arbitrage Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">${totalProfit.toFixed(2)}</span>
                <Badge className="ml-2 bg-green-500/10 text-green-400 border-0">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="text-xs">+{(dailyProfit).toFixed(2)}$ (24h)</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All-time cumulative arbitrage profits</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Percent className="h-4 w-4 mr-2 text-teal-400" />
                Enhanced APY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">+1.82%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Additional yield from arbitrage operations</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-teal-400" />
                Arbitrage Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-blue-400 animate-spin" />
                    <span className="text-muted-foreground">Scanning markets...</span>
                  </div>
                  <Progress value={searchProgress} className="h-1.5" />
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <div className="text-lg font-medium flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <span>Monitoring</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Next scan in ~{Math.floor(Math.random() * 40 + 10)}s</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for opportunities and rates */}
        <Tabs defaultValue="opportunities" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="opportunities">Arbitrage Feed</TabsTrigger>
            <TabsTrigger value="funding">Funding Rates</TabsTrigger>
            <TabsTrigger value="strategies">Arbitrage Strategies</TabsTrigger>
          </TabsList>
          
          {/* Arbitrage Opportunities Tab */}
          <TabsContent value="opportunities">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-medium">Recent Arbitrage Operations</h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="text-xs p-1 rounded-md border border-border/30 bg-background"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  <option>All Assets</option>
                  <option>ETH</option>
                  <option>BTC</option>
                  <option>ARB</option>
                  <option>SOL</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={findArbitrageOpportunities}
                  disabled={isSearching}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Scan Now
                </Button>
              </div>
            </div>
            
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 text-sm font-medium">
                Live Arbitrage Feed
              </div>
              
              <div className="divide-y divide-border/30 max-h-[320px] overflow-y-auto">
                <AnimatePresence>
                  {filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map((opportunity) => (
                      <motion.div 
                        key={opportunity.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 py-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`${getArbitrageTypeInfo(opportunity.type).bgColor} p-1 rounded-md mr-3`}>
                              <ArrowLeftRight className={`h-4 w-4 ${getArbitrageTypeInfo(opportunity.type).color}`} />
                            </div>
                            <div>
                              <div className="font-medium flex items-center text-sm">
                                {opportunity.asset} <span className="mx-1 text-muted-foreground">|</span> 
                                <span className="text-muted-foreground">{opportunity.source}</span> 
                                <ChevronRight className="h-3 w-3 mx-1" /> 
                                <span className="text-muted-foreground">{opportunity.destination}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-500 flex items-center">
                            <span>+${opportunity.profit.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Wallet className="h-3 w-3 mr-1" />
                            <span>{opportunity.amount} {opportunity.asset}</span>
                            <span className="mx-2">•</span>
                            <span className={`capitalize ${getArbitrageTypeInfo(opportunity.type).color}`}>
                              {opportunity.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{opportunity.executionTime}</span>
                            </div>
                            
                            <div className={`flex items-center ${getOpportunityStatusColor(opportunity.status)}`}>
                              {opportunity.status === "discovered" && <AlertCircle className="h-3 w-3 mr-1" />}
                              {opportunity.status === "executing" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                              {opportunity.status === "executed" && <Check className="h-3 w-3 mr-1" />}
                              <span className="capitalize">{opportunity.status}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      <p>No arbitrage opportunities found for the selected asset</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
          
          {/* Funding Rates Tab */}
          <TabsContent value="funding">
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 text-sm font-medium">
                Current Funding Rates (8h)
              </div>
              
              <div className="divide-y divide-border/30">
                {Object.keys(fundingRates).map((venue) => (
                  <div key={venue} className="px-4 py-3">
                    <div className="font-medium mb-2">{venue}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(fundingRates[venue]).map(([asset, rate]) => (
                        <div key={`${venue}-${asset}`} className="px-2 py-1 rounded-md bg-background/40 border border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">{asset}</span>
                            <span className={`text-xs font-medium ${rate < 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {rate > 0 ? '+' : ''}{(rate * 100).toFixed(3)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-blue-500/10 text-xs text-blue-400">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Negative funding rates represent opportunities to earn by holding positions. Our arbitrage engine automatically exploits rate differentials between venues.</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Arbitrage Strategies Tab */}
          <TabsContent value="strategies">
            <div className="space-y-4">
              {arbitrageTypes.map((strategy, index) => (
                <div 
                  key={strategy.type} 
                  className="p-4 border border-border/30 rounded-lg bg-background/50"
                >
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-md ${strategy.bgColor} mr-3`}>
                      <ArrowLeftRight className={`h-5 w-5 ${strategy.color}`} />
                    </div>
                    <div className="font-medium capitalize">{strategy.type} Arbitrage</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {strategy.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Badge variant="outline" className={`${strategy.bgColor} border-0 text-xs ${strategy.color}`}>
                        {index === 0 ? '43%' : index === 1 ? '37%' : '20%'} of profits
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      Avg. profit: ${index === 0 ? '22.40' : index === 1 ? '19.65' : '31.28'} per operation
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-border/20 pt-4">
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <a href="#" className="flex items-center">
            <BarChart3 className="h-3 w-3 mr-2" />
            Advanced Analytics
            <ExternalLink className="h-3 w-3 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
} 