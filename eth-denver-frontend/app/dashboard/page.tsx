"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  Legend,
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
  Loader,
} from "lucide-react";
import {
  ArbitrageOpportunity,
  fetchArbitrageOpportunities,
} from "@/lib/backend-apis";

// Mock data for the dashboard
const generateChartData = () => {
  const data = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      profit: Math.floor(Math.random() * 1000) + 500,
      trades: Math.floor(Math.random() * 20) + 5,
      successRate: Math.floor(Math.random() * 20) + 80,
    });
  }

  return data;
};

const chartData = generateChartData();

const recentTrades = [
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
    fees: 2.34,
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
    fees: 5.67,
  },
  {
    id: 3,
    pair: "SOL/USDT",
    exchange1: "Coinbase",
    exchange2: "Kucoin",
    profit: -42.3,
    time: "12 mins ago",
    profitPercent: 0.3,
    isProfit: false,
    executionTime: "1.5s",
    fees: 1.89,
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
    fees: 3.21,
  },
  {
    id: 5,
    pair: "MATIC/USDT",
    exchange1: "Kucoin",
    exchange2: "Binance",
    profit: 56.2,
    time: "25 mins ago",
    profitPercent: 0.9,
    isProfit: true,
    executionTime: "1.1s",
    fees: 2.45,
  },
];

const _arbitrageOpportunities = [
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
    estimatedTime: "0.8s",
  },
  {
    id: 2,
    pair: "BTC/USDT",
    exchange1: "Kraken",
    price1: 52345.67,
    exchange2: "Binance",
    price2: 52765.89,
    difference: 420.22,
    percent: 0.8,
    risk: "low",
    estimatedTime: "1.2s",
  },
  {
    id: 3,
    pair: "SOL/USDT",
    exchange1: "Binance",
    price1: 102.45,
    exchange2: "Kucoin",
    price2: 103.78,
    difference: 1.33,
    percent: 1.3,
    risk: "medium",
    estimatedTime: "1.5s",
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
    estimatedTime: "0.9s",
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
    estimatedTime: "1.1s",
  },
];

const portfolioData = [
  { name: "BTC", value: 45 },
  { name: "ETH", value: 30 },
  { name: "SOL", value: 15 },
  { name: "Other", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const exchangesList = [
  { id: 1, name: "Binance", type: "CEX", status: "connected", apiHealth: 100 },
  { id: 2, name: "Coinbase", type: "CEX", status: "connected", apiHealth: 98 },
  { id: 3, name: "Kraken", type: "CEX", status: "connected", apiHealth: 100 },
  { id: 4, name: "Kucoin", type: "CEX", status: "disconnected", apiHealth: 0 },
  { id: 5, name: "Huobi", type: "CEX", status: "connected", apiHealth: 92 },
  { id: 6, name: "Uniswap", type: "DEX", status: "connected", apiHealth: 100 },
  {
    id: 7,
    name: "PancakeSwap",
    type: "DEX",
    status: "connected",
    apiHealth: 95,
  },
];

const aiLogs = [
  {
    id: 1,
    message: "Scanning market for arbitrage opportunities...",
    type: "info",
    time: "Just now",
  },
  {
    id: 2,
    message: "Found potential ETH/USDT arbitrage on Binance → Coinbase",
    type: "success",
    time: "30s ago",
  },
  {
    id: 3,
    message: "Executing trade: Buy ETH on Binance at $3245.78",
    type: "action",
    time: "25s ago",
  },
  {
    id: 4,
    message: "Sell ETH on Coinbase at $3285.45",
    type: "action",
    time: "24s ago",
  },
  {
    id: 5,
    message: "Trade completed: +$39.67 profit (1.22%)",
    type: "success",
    time: "23s ago",
  },
  {
    id: 6,
    message: "Analyzing BTC/USDT price discrepancy on Kraken and Binance",
    type: "info",
    time: "15s ago",
  },
  {
    id: 7,
    message: "Warning: MATIC/USDT spread narrowing, monitoring closely",
    type: "warning",
    time: "5s ago",
  },
];

export default function Dashboard() {
  const [isTrading, setIsTrading] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [inArbitrage, setInArbitrage] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [stopLoss, setStopLoss] = useState(2.0);
  const [maxCapital, setMaxCapital] = useState(50);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChartTab, setActiveChartTab] = useState("profit");
  const [activeChartPeriod, setActiveChartPeriod] = useState("daily");
  const logEndRef = useRef<HTMLDivElement>(null);

  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<
    ArbitrageOpportunity[]
  >([]);
  const [arbitrageOpportunitiesLoading, setArbitrageOpportunitiesLoading] =
    useState<boolean>(false);

  async function getOpportunities() {
    try {
      setArbitrageOpportunitiesLoading(true);

      const data = await fetchArbitrageOpportunities();
      setArbitrageOpportunities(data);
    } catch (err) {
      console.log("Failed to fetch opportunities");
    } finally {
      setArbitrageOpportunitiesLoading(false);
    }
  }

  useEffect(() => {
    getOpportunities();
  }, []);

  // Animate stats on load
  useEffect(() => {
    const profitInterval = setInterval(() => {
      setTotalProfit((prev) => {
        if (prev < 12580) return prev + 100;
        clearInterval(profitInterval);
        return 12580;
      });
    }, 20);

    const todayProfitInterval = setInterval(() => {
      setTodayProfit((prev) => {
        if (prev < 845) return prev + 10;
        clearInterval(todayProfitInterval);
        return 845;
      });
    }, 30);

    const tradesInterval = setInterval(() => {
      setTotalTrades((prev) => {
        if (prev < 128) return prev + 1;
        clearInterval(tradesInterval);
        return 128;
      });
    }, 40);

    const portfolioInterval = setInterval(() => {
      setPortfolioValue((prev) => {
        if (prev < 85420) return prev + 1000;
        clearInterval(portfolioInterval);
        return 85420;
      });
    }, 25);

    const balanceInterval = setInterval(() => {
      setAvailableBalance((prev) => {
        if (prev < 42500) return prev + 500;
        clearInterval(balanceInterval);
        return 42500;
      });
    }, 35);

    const arbitrageInterval = setInterval(() => {
      setInArbitrage((prev) => {
        if (prev < 42920) return prev + 500;
        clearInterval(arbitrageInterval);
        return 42920;
      });
    }, 35);

    const successRateInterval = setInterval(() => {
      setSuccessRate((prev) => {
        if (prev < 94.5) return prev + 1;
        clearInterval(successRateInterval);
        return 94.5;
      });
    }, 50);

    return () => {
      clearInterval(profitInterval);
      clearInterval(todayProfitInterval);
      clearInterval(tradesInterval);
      clearInterval(portfolioInterval);
      clearInterval(balanceInterval);
      clearInterval(arbitrageInterval);
      clearInterval(successRateInterval);
    };
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiLogs]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Risk color mapping
  const getRiskColor = (risk: "low" | "medium" | "high"): string => {
    switch (risk) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-green-400";
    }
  };

  // Log type color mapping
  // Define the log type
  type LogType = "info" | "success" | "warning" | "error" | "action";

  // Log type color mapping
  const getLogTypeColor = (type: LogType): string => {
    switch (type) {
      case "info":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "action":
        return "text-purple-400";
      default:
        return "text-muted-foreground";
    }
  };

  // Log type icon mapping (fixed from getLogTypeColor to getLogTypeIcon)
  const getLogTypeIcon = (type: LogType) => {
    switch (type) {
      case "info":
        return <Activity className="h-4 w-4" />;
      case "success":
        return <Check className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <X className="h-4 w-4" />;
      case "action":
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
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
              <h1 className="text-3xl font-bold">
                AI Arbitrage Command Center
              </h1>
              <p className="text-muted-foreground">
                Monitor and control your AI trading operations
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div
                className={`px-3 py-1 rounded-full flex items-center ${
                  isTrading
                    ? "bg-green-500/20 text-green-400 animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Zap
                  className={`h-4 w-4 mr-1 ${
                    isTrading ? "text-green-400" : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">
                  {isTrading ? "AI Active" : "AI Paused"}
                </span>
              </div>
              <Switch
                id="trading-mode"
                checked={isTrading}
                onCheckedChange={setIsTrading}
                className={isTrading ? "bg-green-500 shadow-glow-blue" : ""}
              />
              <Label htmlFor="trading-mode" className="font-medium">
                {isTrading ? "Trading" : "Paused"}
              </Label>
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold">
                    ${totalProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
                <Progress className="h-1 mt-4" value={75} />
              </CardContent>
            </Card>

            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold">
                    ${todayProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+5.2% from yesterday</span>
                </div>
                <Progress className="h-1 mt-4" value={65} />
              </CardContent>
            </Card>

            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold">
                    {successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-blue-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+2.3% from last week</span>
                </div>
                <Progress className="h-1 mt-4" value={successRate} />
              </CardContent>
            </Card>

            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-2xl font-bold">{totalTrades}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-purple-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>12 trades in last hour</span>
                </div>
                <Progress className="h-1 mt-4" value={85} />
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold">
                    ${portfolioValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-blue-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+8.2% from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold">
                    ${availableBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <span>Available for trading</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Arbitrage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-2xl font-bold">
                    ${inArbitrage.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <span>Currently in active trades</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <Tabs
                defaultValue="profit"
                className="mb-8"
                value={activeChartTab}
                onValueChange={setActiveChartTab}
              >
                <TabsList className="bg-background/50 mb-4">
                  <TabsTrigger value="profit">Profit Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>

                <TabsContent value="profit" className="mt-0">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Profit Overview</CardTitle>
                        <Tabs
                          defaultValue="daily"
                          value={activeChartPeriod}
                          onValueChange={setActiveChartPeriod}
                          className="w-auto"
                        >
                          <TabsList className="bg-background/50">
                            <TabsTrigger value="daily" className="text-xs">
                              Daily
                            </TabsTrigger>
                            <TabsTrigger value="weekly" className="text-xs">
                              Weekly
                            </TabsTrigger>
                            <TabsTrigger value="monthly" className="text-xs">
                              Monthly
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="profitGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="hsl(var(--chart-1))"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="hsl(var(--chart-1))"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--muted))"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                color: "hsl(var(--card-foreground))",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="profit"
                              stroke="hsl(var(--chart-1))"
                              fillOpacity={1}
                              fill="url(#profitGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="mt-0">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Trading Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--muted))"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                              yAxisId="left"
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                              orientation="right"
                              yAxisId="right"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                color: "hsl(var(--card-foreground))",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="successRate"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              yAxisId="right"
                              name="Success Rate (%)"
                            />
                            <Line
                              type="monotone"
                              dataKey="trades"
                              stroke="hsl(var(--chart-3))"
                              strokeWidth={2}
                              yAxisId="left"
                              name="Number of Trades"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio" className="mt-0">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {portfolioData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                color: "hsl(var(--card-foreground))",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Recent Trades */}
              <Card className="glassmorphism mb-8">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Trades</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/40">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                            Pair
                          </th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                            Route
                          </th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                            Profit
                          </th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                            Execution
                          </th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTrades.map((trade) => (
                          <motion.tr
                            key={trade.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-b border-border/20 hover:bg-background/40"
                          >
                            <td className="py-3 px-4 font-medium">
                              {trade.pair}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {trade.exchange1} → {trade.exchange2}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-medium ${
                                trade.isProfit
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              <div className="flex items-center justify-end">
                                {trade.isProfit ? (
                                  <ArrowUpRight className="h-4 w-4 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 mr-1" />
                                )}
                                ${Math.abs(trade.profit).toFixed(2)}
                                <span className="text-xs ml-1">
                                  ({trade.profitPercent.toFixed(1)}%)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              {trade.executionTime}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              {trade.time}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* AI Logs */}
              <Card className="glassmorphism">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>AI Trading Logs</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${
                        isTrading
                          ? "bg-green-500/20 text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isTrading ? "Live" : "Paused"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto bg-background/30 rounded-md p-3 border border-border/30">
                    {aiLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-2 text-sm"
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-0.5 mr-2 ${getLogTypeColor(
                              log.type
                            )}`}
                          >
                            {getLogTypeIcon(log.type)}
                          </div>
                          <div>
                            <span className={`${getLogTypeColor(log.type)}`}>
                              {log.message}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {log.time}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div>
              {/* Live Opportunities */}
              <Card className="glassmorphism mb-8">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Live Opportunities</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getOpportunities}
                      disabled={arbitrageOpportunitiesLoading}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {arbitrageOpportunitiesLoading && (
                    <div className="flex items-center justify-center h-40">
                      <Loader className="h-6 w-6 text-blue-400" />
                    </div>
                  )}
                  {!arbitrageOpportunitiesLoading &&
                    arbitrageOpportunities.length === 0 && (
                      <div className="flex items-center justify-center h-40">
                        <span className="text-muted-foreground">
                          No opportunities found
                        </span>
                      </div>
                    )}

                  <div className="space-y-4">
                    {arbitrageOpportunities.map((opportunity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg bg-background/50 border border-border/30 hover:shadow-glow-blue transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">{`${opportunity.token.symbol}`}</span>
                          <span className="text-green-400 font-medium">
                            +{opportunity.priceDifferencePercent.toFixed(2)}%
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground mb-3">
                          <span>
                            {opportunity.sourceNetwork} →{" "}
                            {opportunity.targetNetwork}
                          </span>
                          <span>${opportunity.netProfitUSD.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs mb-3">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground mb-1">
                              Buy at
                            </span>
                            <span className="font-medium">
                              ${opportunity.sourcePriceUSD.toFixed(2)}
                            </span>
                          </div>

                          <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                          <div className="flex flex-col items-end">
                            <span className="text-muted-foreground mb-1">
                              Sell at
                            </span>
                            <span className="font-medium">
                              ${opportunity.targetPriceUSD.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs mb-3">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Est. fee: {opportunity.estimatedBridgeCost}
                            </span>
                          </div>

                          <div
                            className={`flex items-center ${getRiskColor(
                              "low"
                            )}`}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span className="capitalize">
                              {opportunity.estimatedGasCost} gas
                            </span>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-1 bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white"
                          size="sm"
                          disabled={!isTrading}
                        >
                          {isTrading ? "Execute Trade" : "Enable Trading"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Management */}
              <Card className="glassmorphism mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-400" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-slippage">Max Slippage</Label>
                        <span className="text-sm text-muted-foreground">
                          {maxSlippage}%
                        </span>
                      </div>
                      <Slider
                        id="max-slippage"
                        min={0.1}
                        max={2}
                        step={0.1}
                        value={[maxSlippage]}
                        onValueChange={(value) => setMaxSlippage(value[0])}
                        className="py-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="stop-loss">Stop Loss Threshold</Label>
                        <span className="text-sm text-muted-foreground">
                          {stopLoss}%
                        </span>
                      </div>
                      <Slider
                        id="stop-loss"
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={[stopLoss]}
                        onValueChange={(value) => setStopLoss(value[0])}
                        className="py-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-capital">
                          Max Capital Per Trade
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {maxCapital}%
                        </span>
                      </div>
                      <Slider
                        id="max-capital"
                        min={5}
                        max={100}
                        step={5}
                        value={[maxCapital]}
                        onValueChange={(value) => setMaxCapital(value[0])}
                        className="py-2"
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white"
                      size="sm"
                    >
                      Save Risk Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Connectivity */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-purple-400" />
                    Exchange Connectivity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exchangesList.map((exchange) => (
                      <div
                        key={exchange.id}
                        className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30"
                      >
                        <div>
                          <div className="font-medium">{exchange.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {exchange.type}
                          </div>
                        </div>

                        <div className="flex items-center">
                          {exchange.status === "connected" ? (
                            <Badge className="mr-2 bg-green-500/20 text-green-400 hover:bg-green-500/30">
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="mr-2 bg-red-500/20 text-red-400 hover:bg-red-500/30">
                              Disconnected
                            </Badge>
                          )}

                          <Switch
                            checked={exchange.status === "connected"}
                            className={
                              exchange.status === "connected"
                                ? "bg-green-500"
                                : ""
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full mt-2 border-dashed"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect New Exchange
                    </Button>
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
