"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Mock trade data
const initialTrades = [
  {
    id: "trade-1",
    venue: "HyperEVM DEX",
    asset: "WETH",
    direction: "short",
    size: 3.2,
    leverage: 2.5,
    entryPrice: 3475.82,
    status: "opening",
    timestamp: Date.now() - 25000,
    fundingRate: -0.0012,
    executor: "OktoSDK"
  },
  {
    id: "trade-2",
    venue: "HyperEVM Perps",
    asset: "WBTC",
    direction: "short",
    size: 0.18,
    leverage: 2.0,
    entryPrice: 61243.75,
    status: "open",
    timestamp: Date.now() - 180000,
    fundingRate: -0.0008,
    executor: "OktoSDK"
  },
  {
    id: "trade-3",
    venue: "Hyperliquid",
    asset: "SOL",
    direction: "short",
    size: 85.5,
    leverage: 1.5,
    entryPrice: 152.32,
    status: "open",
    timestamp: Date.now() - 360000,
    fundingRate: -0.0015,
    executor: "OktoSDK"
  }
];

export default function HyperEvmPositions() {
  const [trades, setTrades] = useState(initialTrades);
  const [isOpening, setIsOpening] = useState(false);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [totalDelta, setTotalDelta] = useState(-0.004);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    // Simulate the first trade opening
    const intervalId = setInterval(() => {
      setTrades(current => 
        current.map(trade => 
          trade.id === "trade-1" && trade.status === "opening" 
            ? { ...trade, status: "open" } 
            : trade
        )
      );
      clearInterval(intervalId);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const openNewPosition = () => {
    setIsOpening(true);
    setOpeningProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setOpeningProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Add new trade after progress completes
          setTimeout(() => {
            const newTrade = {
              id: `trade-${Math.random().toString(36).substr(2, 9)}`,
              venue: "HyperEVM DEX",
              asset: "ARB",
              direction: "short",
              size: 175.2,
              leverage: 2.0,
              entryPrice: 1.23,
              status: "opening",
              timestamp: Date.now(),
              fundingRate: -0.0021,
              executor: "OktoSDK"
            };
            
            setTrades(prev => [newTrade, ...prev]);
            
            // Then change status to open after a delay
            setTimeout(() => {
              setTrades(prev => 
                prev.map(trade => 
                  trade.id === newTrade.id 
                    ? { ...trade, status: "open" } 
                    : trade
                )
              );
              setIsOpening(false);
            }, 3000);
          }, 500);
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };
  
  // Calculate delta value 
  useEffect(() => {
    let delta = 0;
    trades.forEach(trade => {
      if (trade.status === "open") {
        const tradeValue = trade.size * trade.entryPrice * trade.leverage;
        delta += trade.direction === "long" ? tradeValue / 100000 : -tradeValue / 100000;
      }
    });
    
    setTotalDelta(parseFloat(delta.toFixed(4)));
  }, [trades]);

  return (
    <Card className="w-full mb-8 glassmorphism">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-400" />
              HyperEVM Delta Positions
            </CardTitle>
            <CardDescription>
              Delta-neutral hedging positions via Okto SDK on HyperEVM
            </CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-orange-500/10 text-orange-500 border-orange-500/20">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
              <span>HyperEVM Testnet</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Header stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Total Value Hedged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$387,215</div>
              <p className="text-xs text-muted-foreground">Via HyperEVM & Hyperliquid</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Net Delta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-baseline">
                {totalDelta} <span className="text-sm ml-1 text-muted-foreground">Δ</span>
              </div>
              <div className="flex items-center text-xs text-green-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Delta-neutral threshold maintained
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Okto SDK Txs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Mobile-initiated positions</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Opening process indicator */}
        {isOpening && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 border border-orange-500/20 rounded-lg bg-orange-500/5"
          >
            <div className="flex items-center mb-2">
              <RefreshCw className="h-5 w-5 mr-2 text-orange-400 animate-spin" />
              <h3 className="font-medium">Opening position via Okto SDK...</h3>
            </div>
            
            <div className="space-y-2">
              <Progress value={openingProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {openingProgress < 20 && "Initializing Okto wallet and preparing HyperEVM transaction..."}
                {openingProgress >= 20 && openingProgress < 50 && "Calculating optimal position size for delta neutrality..."}
                {openingProgress >= 50 && openingProgress < 80 && "Submitting transaction to HyperEVM via Okto SDK..."}
                {openingProgress >= 80 && "Finalizing position and updating balance..."}
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Tabs for wallet and positions */}
        <Tabs defaultValue="positions">
          <TabsList className="mb-4">
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="wallet">Okto Wallet</TabsTrigger>
          </TabsList>
          
          {/* Positions tab */}
          <TabsContent value="positions">
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 text-sm font-medium flex justify-between">
                <span>Delta Positions on HyperEVM</span>
                <span className="text-muted-foreground">Total: {trades.length}</span>
              </div>
              
              <div className="divide-y divide-border/30">
                <AnimatePresence>
                  {trades.map((trade) => (
                    <motion.div 
                      key={trade.id}
                      initial={trade.status === "opening" ? { opacity: 0, y: -10 } : { opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {trade.status === "opening" ? (
                            <div className="w-2 h-2 rounded-full bg-orange-400 mr-3 animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                          )}
                          <div>
                            <div className="font-medium flex items-center">
                              {trade.asset} {trade.direction === "long" ? "Long" : "Short"}
                              <Badge className="ml-2 text-xs" variant="outline">
                                {trade.venue}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${trade.direction === 'long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} border-0`}
                        >
                          {trade.direction === 'long' ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {trade.leverage}x
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">Size</div>
                          <div>{trade.size.toFixed(2)} (${(trade.size * trade.entryPrice).toLocaleString()})</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Entry Price</div>
                          <div>${trade.entryPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Funding</div>
                          <div className={trade.fundingRate < 0 ? "text-green-500" : "text-red-500"}>
                            {trade.fundingRate.toFixed(4)}%
                          </div>
                        </div>
                      </div>
                      
                      {trade.status === "opening" && (
                        <div className="mt-2 flex items-center text-xs text-orange-400">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Opening position via {trade.executor}...
                        </div>
                      )}
                      
                      {trade.status === "open" && (
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />
                          Executed via {trade.executor} • {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
          
          {/* Wallet tab */}
          <TabsContent value="wallet">
            <div className="border border-border/30 rounded-lg overflow-hidden p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                    <img src="https://i.imgur.com/v7bwJMf.png" alt="Okto" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium">Okto Smart Wallet</div>
                    <div className="text-xs text-muted-foreground">HyperEVM Enabled</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-0">
                  Connected
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border border-border/20 rounded-md bg-background/30">
                  <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
                  <div className="text-sm font-mono">0x82a...3f9c</div>
                </div>
                
                <div className="p-3 border border-border/20 rounded-md bg-background/30">
                  <div className="text-xs text-muted-foreground mb-1">Network</div>
                  <div className="text-sm flex items-center">
                    HyperEVM Testnet
                    <div className="w-2 h-2 rounded-full bg-green-400 ml-2"></div>
                  </div>
                </div>
                
                <div className="p-3 border border-border/20 rounded-md bg-background/30">
                  <div className="text-xs text-muted-foreground mb-1">Balance</div>
                  <div className="text-sm">2.5 ETH ($8,750)</div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-2 border border-border/20 rounded-md bg-background/30 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center mr-2">
                        <Zap className="h-3 w-3 text-orange-400" />
                      </div>
                      <div className="text-sm">Open {i === 1 ? 'ARB' : i === 2 ? 'WETH' : 'WBTC'} Position</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i === 1 ? '2' : i === 2 ? '15' : '45'} mins ago
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="text-sm">
          <ExternalLink className="h-3 w-3 mr-2" />
          View on HyperEVM Explorer
        </Button>
        
        <Button 
          variant="default" 
          onClick={openNewPosition}
          disabled={isOpening}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {isOpening ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Opening Position...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Open Delta Position
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 