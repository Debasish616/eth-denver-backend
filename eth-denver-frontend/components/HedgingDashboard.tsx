"use client";

import React, { useState } from 'react';
import { useHedging } from '@/context/HedgingContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from "recharts";

import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart as BarChartIcon,
  RefreshCw,
  Activity,
  Layers,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Check,
  X,
  ExternalLink,
  Shield
} from "lucide-react";

// Generate random delta-neutral data for the last 30 days
const generateDeltaData = () => {
  const data = [];
  const now = new Date();
  let netValue = 0;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate random deltas between -0.05 and +0.05
    const delta = (Math.random() * 0.1 - 0.05).toFixed(4);
    netValue += parseFloat(delta);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      delta: parseFloat(delta),
      netValue: parseFloat(netValue.toFixed(4)),
      rebalances: Math.floor(Math.random() * 3) + 1 // 1-3 rebalances per day
    });
  }
  
  return data;
};

export function HedgingDashboard() {
  const { 
    hedgingPositions, 
    totalHedgedValue, 
    hedgingRatio, 
    netDelta, 
    profitLoss,
    averageExecutionTime,
    rebalancingFrequency,
    hedgingEvents,
    rebalancePositions
  } = useHedging();
  
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [deltaNeutralData] = useState(generateDeltaData());
  
  const handleRebalance = async () => {
    setIsRebalancing(true);
    await rebalancePositions();
    setIsRebalancing(false);
  };
  
  const longPositions = hedgingPositions.filter(p => p.direction === 'LONG');
  const shortPositions = hedgingPositions.filter(p => p.direction === 'SHORT');
  
  const longValue = longPositions.reduce((sum, p) => sum + p.size, 0);
  const shortValue = shortPositions.reduce((sum, p) => sum + p.size, 0);
  
  const pieData = [
    { name: 'Long Positions', value: longValue },
    { name: 'Short Positions', value: shortValue },
  ];
  
  const COLORS = ['#0088FE', '#FF8042'];
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  return (
    <div className="space-y-6">
      <Card className="glassmorphism">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-400" />
                Delta-Neutral Hedging Engine
              </CardTitle>
              <CardDescription>
                Automated risk management through perpetual futures
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={handleRebalance}
              disabled={isRebalancing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRebalancing ? 'animate-spin' : ''}`} />
              {isRebalancing ? 'Rebalancing...' : 'Rebalance Now'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Total Hedged Value</div>
              <div className="text-2xl font-bold">${totalHedgedValue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Across {hedgingPositions.length} active positions
              </div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Net Delta</div>
              <div className="text-2xl font-bold flex items-center">
                {netDelta > 0 ? (
                  <>
                    <ArrowUpRight className="h-5 w-5 text-green-400 mr-1" />
                    <span className={netDelta > 0.02 ? 'text-yellow-400' : 'text-green-400'}>
                      +{netDelta.toFixed(4)}
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-5 w-5 text-red-400 mr-1" />
                    <span className={netDelta < -0.02 ? 'text-yellow-400' : 'text-blue-400'}>
                      {netDelta.toFixed(4)}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.abs(netDelta) < 0.01 ? 'Optimal neutrality' : 'Approaching rebalance threshold'}
              </div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Hedging Efficiency</div>
              <div className="text-2xl font-bold">{(hedgingRatio * 100).toFixed(1)}%</div>
              <div className="mt-1">
                <Progress value={hedgingRatio * 100} className="h-1" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: 99.5% efficiency
              </div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">Hedging P&L</div>
              <div className="text-2xl font-bold flex items-center">
                {profitLoss >= 0 ? (
                  <span className="text-green-400">+${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) : (
                  <span className="text-red-400">-${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last 24 hours
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Active Positions</TabsTrigger>
              <TabsTrigger value="history">Rebalance History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg border border-border/30 p-4">
                  <h3 className="text-sm font-medium mb-3">Delta Neutrality Over Time</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={deltaNeutralData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => value.toFixed(2)} domain={[-0.2, 0.2]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="delta"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                          name="Daily Delta"
                        />
                        <Line
                          type="monotone"
                          dataKey="netValue"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={false}
                          name="Net Delta"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-background/50 rounded-lg border border-border/30 p-4">
                  <h3 className="text-sm font-medium mb-3">Position Distribution</h3>
                  <div className="h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-1"></div>
                      <span>Long: ${longValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF8042] mr-1"></div>
                      <span>Short: ${shortValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg border border-border/30 p-4">
                <h3 className="text-sm font-medium mb-3">Hedging Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Auto-Rebalance Frequency</div>
                    <div className="font-medium">{rebalancingFrequency} minutes</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Average Execution Time</div>
                    <div className="font-medium">{averageExecutionTime.toFixed(2)} seconds</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Rebalance Threshold</div>
                    <div className="font-medium">±0.05 delta deviation</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Position Size Limit</div>
                    <div className="font-medium">$75,000 per position</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Max Leverage</div>
                    <div className="font-medium">3x</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Risk Mitigation</div>
                    <div className="font-medium">Multi-venue execution</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="positions">
              <div className="space-y-2">
                {hedgingPositions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active hedging positions
                  </div>
                ) : (
                  hedgingPositions.map(position => (
                    <div 
                      key={position.id} 
                      className="bg-background/50 rounded-lg border border-border/30 p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{position.pair}</h3>
                            <Badge 
                              variant={position.direction === 'LONG' ? 'default' : 'destructive'} 
                              className="ml-2"
                            >
                              {position.direction}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${position.status === 'REBALANCING' ? 'bg-yellow-500/20 text-yellow-500' : ''}`}
                            >
                              {position.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {position.exchange} • {formatTimeAgo(position.timestamp)} • {position.leverage}x leverage
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${position.size.toLocaleString()}</div>
                          <div className={`text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between text-xs">
                        <div>
                          <div className="text-muted-foreground">Entry</div>
                          <div>${position.entryPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Current</div>
                          <div>${position.currentPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Collateral</div>
                          <div>${position.collateral.toLocaleString()} {position.collateralToken}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Efficiency</div>
                          <div>{(position.hedgingRatio * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-2">
                {hedgingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hedging events recorded
                  </div>
                ) : (
                  hedgingEvents.slice(0, 10).map((event, index) => (
                    <div 
                      key={index} 
                      className="bg-background/50 rounded-lg border border-border/30 p-3 flex items-center"
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center mr-3
                        ${event.type === 'OPEN' ? 'bg-blue-500/20' : ''}
                        ${event.type === 'REBALANCE' ? 'bg-yellow-500/20' : ''}
                        ${event.type === 'CLOSE' ? 'bg-red-500/20' : ''}
                        ${event.type === 'HEDGE' ? 'bg-green-500/20' : ''}
                      `}>
                        {event.type === 'OPEN' && <Layers className="h-4 w-4 text-blue-500" />}
                        {event.type === 'REBALANCE' && <RefreshCw className="h-4 w-4 text-yellow-500" />}
                        {event.type === 'CLOSE' && <X className="h-4 w-4 text-red-500" />}
                        {event.type === 'HEDGE' && <Shield className="h-4 w-4 text-green-500" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {event.type === 'OPEN' && `New ${event.direction} position on ${event.pair}`}
                            {event.type === 'REBALANCE' && `Delta rebalancing (Δ${event.delta > 0 ? '+' : ''}${event.delta})`}
                            {event.type === 'CLOSE' && `Closed ${event.position?.direction} position on ${event.position?.pair}`}
                            {event.type === 'HEDGE' && `Hedged ${event.token} conversion`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(event.timestamp)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.type === 'OPEN' && `$${event.size.toLocaleString()} on ${event.exchange}`}
                          {event.type === 'REBALANCE' && `Executed in ${event.executionTime}s`}
                          {event.type === 'CLOSE' && `${event.position?.pnl >= 0 ? '+' : ''}$${event.position?.pnl.toLocaleString()} PnL`}
                          {event.type === 'HEDGE' && `${event.amount} ${event.token} ($${event.valueInUsd.toLocaleString()})`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-background/30 border-t border-border/30 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center">
            <div>
              Powered by NexusArb's Delta-Neutral Protocol • Last rebalanced: {new Date().toLocaleTimeString()}
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <a href="#" className="flex items-center">Advanced Settings <ExternalLink className="h-3 w-3 ml-1" /></a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 