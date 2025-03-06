"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3, 
  Activity,
  ChevronRight,
  Shield,
  ExternalLink,
  Clock,
  BadgeCheck,
  Server,
  AlertCircle,
  Zap,
  BookOpen
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for recent AI predictions
const initialPredictions = [
  {
    id: "pred-1",
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    model: "DeepSeek R1",
    marketCondition: "Bearish",
    confidence: 0.87,
    recommendation: "Increase short positions by 2.5%",
    applied: true,
    verified: true,
    proofHash: "0x7e2fc91ef7d0e39f4da8429f7854b99c3a62e0a27d4be149cd250ec7da2e143a"
  },
  {
    id: "pred-2",
    timestamp: Date.now() - 1000 * 60 * 18, // 18 minutes ago
    model: "Llama 3.3 70B",
    marketCondition: "Choppy",
    confidence: 0.72,
    recommendation: "Maintain current positions, decrease leverage by 0.2x",
    applied: true,
    verified: true,
    proofHash: "0x3a4bd92ef1d5e286f41c957089d413854b782c7a53982e88f2526caf45d8e24f"
  },
  {
    id: "pred-3",
    timestamp: Date.now() - 1000 * 60 * 42, // 42 minutes ago
    model: "Mistral 7B v0.3",
    marketCondition: "Bullish",
    confidence: 0.65,
    recommendation: "Adjust hedge ratio to 0.98",
    applied: true,
    verified: true,
    proofHash: "0x9c42f758b782c5e982e88f2526caf45d8e24f3a4bd92ef1d5e286f41c957089d"
  }
];

// Model performance data
const modelPerformance = [
  { name: "DeepSeek R1", accuracy: 92, latency: "231ms", cost: "Lowest", usage: 64 },
  { name: "Llama 3.3 70B", accuracy: 88, latency: "378ms", cost: "Medium", usage: 26 },
  { name: "Mistral 7B", accuracy: 79, latency: "195ms", cost: "Low", usage: 10 }
];

export default function OraRmsIntegration() {
  const [predictions, setPredictions] = useState(initialPredictions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState("DeepSeek R1");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // New prediction inference state
  const [currentMarketState, setCurrentMarketState] = useState("Analyzing...");
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  // Simulate automatic market analysis every 3 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnalyzing) {
        runMarketAnalysis();
      }
    }, 15000); // For demo, run after 15 seconds
    
    return () => clearTimeout(timer);
  }, [predictions, isAnalyzing]);
  
  const runMarketAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentMarketState("Analyzing...");
    setCurrentConfidence(0);
    
    // Simulate inference and verification progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Generate market condition and confidence
          const marketConditions = ["Bullish", "Bearish", "Neutral", "Choppy"];
          const selectedCondition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
          const generatedConfidence = Math.round((0.65 + Math.random() * 0.3) * 100) / 100;
          
          setCurrentMarketState(selectedCondition);
          setCurrentConfidence(generatedConfidence);
          
          // Add new prediction after a delay
          setTimeout(() => {
            const recommendations = {
              "Bullish": [
                "Reduce short positions by 3.2%",
                "Decrease hedge ratio to 0.96",
                "Move 2% of funds to yield farming"
              ],
              "Bearish": [
                "Increase short positions by 2.8%",
                "Increase hedge ratio to 1.04",
                "Move additional stables to hedging pool"
              ],
              "Neutral": [
                "Maintain current positions",
                "Optimize for funding rate arbitrage",
                "Rebalance across venues for fee efficiency"
              ],
              "Choppy": [
                "Reduce leverage by 0.3x across positions",
                "Increase position diversity across assets",
                "Focus on short-term funding opportunities"
              ]
            };
            
            const selectedRecommendation = recommendations[selectedCondition][
              Math.floor(Math.random() * recommendations[selectedCondition].length)
            ];
            
            const newPrediction = {
              id: `pred-${Date.now()}`,
              timestamp: Date.now(),
              model: selectedModel,
              marketCondition: selectedCondition,
              confidence: generatedConfidence,
              recommendation: selectedRecommendation,
              applied: true,
              verified: true,
              proofHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
            };
            
            setPredictions(prev => [newPrediction, ...prev.slice(0, 4)]);
            setIsAnalyzing(false);
            setShowVerificationDialog(true);
            
          }, 1000);
          
          return 100;
        }
        return prev + (Math.random() * 5 + 3);
      });
    }, 200);
  };
  
  const getConditionColor = (condition) => {
    switch(condition) {
      case "Bullish": return "text-green-500";
      case "Bearish": return "text-red-500";
      case "Neutral": return "text-blue-500";
      case "Choppy": return "text-yellow-500";
      default: return "text-muted-foreground";
    }
  };
  
  const getConditionBg = (condition) => {
    switch(condition) {
      case "Bullish": return "bg-green-500/10";
      case "Bearish": return "bg-red-500/10";
      case "Neutral": return "bg-blue-500/10";
      case "Choppy": return "bg-yellow-500/10";
      default: return "bg-muted/10";
    }
  };
  
  return (
    <Card className="w-full mb-8 glassmorphism">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-400" />
              ORA RMS AI Hedging Oracle
            </CardTitle>
            <CardDescription>
              Verifiable AI-powered market analysis and position management
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-3 py-1 bg-purple-500/10 text-purple-500 border-purple-500/20">
                  <div className="flex items-center">
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    <span>Verifiable AI</span>
                  </div>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  All AI predictions are verified on-chain through ORA RMS for transparency and security
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Analysis Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-400" />
                Current Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-purple-400 animate-spin" />
                    <span className="text-muted-foreground">Analyzing via {selectedModel}...</span>
                  </div>
                  <Progress value={analysisProgress} className="h-1.5" />
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold flex items-center">
                    <span className={getConditionColor(currentMarketState)}>{currentMarketState}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <BadgeCheck className="h-3 w-3 mr-1 text-purple-400" />
                    <span>Confidence: {(currentConfidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2 text-purple-400" />
                Verifiable AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions.length}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />
                <span>Verified predictions</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Server className="h-4 w-4 mr-2 text-purple-400" />
                Preferred Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">DeepSeek R1</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Lowest cost, highest accuracy</span>
                <Badge className="ml-2 bg-green-500/10 text-green-400 border-0 text-xs">
                  92% acc
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Verification dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Verified AI Prediction</DialogTitle>
              <DialogDescription>
                ORA RMS has verified this prediction on-chain with cryptographic proof
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-3 border border-green-500/20 rounded-md bg-green-500/5">
                <div className="flex items-center mb-2">
                  <BadgeCheck className="h-5 w-5 mr-2 text-green-500" />
                  <h4 className="font-medium text-green-500">Verification Successful</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  This prediction has been cryptographically verified through ORA RMS and recorded on-chain
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Model:</div>
                  <div className="text-sm">{selectedModel}</div>
                  
                  <div className="text-sm font-medium">Market Condition:</div>
                  <div className="text-sm">{currentMarketState}</div>
                  
                  <div className="text-sm font-medium">Confidence:</div>
                  <div className="text-sm">{(currentConfidence * 100).toFixed(1)}%</div>
                  
                  <div className="text-sm font-medium">Timestamp:</div>
                  <div className="text-sm">{new Date().toLocaleString()}</div>
                </div>
                
                <div className="pt-2 text-sm text-muted-foreground border-t">
                  <div className="font-medium mb-1">Verification Proof:</div>
                  <div className="font-mono text-xs break-all">
                    {predictions[0]?.proofHash || "0x7e2fc91ef7d0e39f4da8429f785..."}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowVerificationDialog(false)}>
                Close
              </Button>
              <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="h-3 w-3 mr-2" />
                View on ORA Explorer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Tabs for predictions and models */}
        <Tabs defaultValue="predictions">
          <TabsList className="mb-4">
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            {showTechnicalDetails && <TabsTrigger value="technical">Technical Details</TabsTrigger>}
          </TabsList>
          
          {/* Predictions tab */}
          <TabsContent value="predictions">
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 text-sm font-medium">
                Recent Market Predictions & Hedging Recommendations
              </div>
              
              <div className="divide-y divide-border/30">
                <AnimatePresence>
                  {predictions.map((prediction) => (
                    <motion.div 
                      key={prediction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getConditionBg(prediction.marketCondition)} mr-3`}>
                            <div className={`w-2 h-2 rounded-full ${getConditionColor(prediction.marketCondition)}`}></div>
                          </div>
                          <div>
                            <div className="font-medium flex items-center">
                              {prediction.marketCondition} Market
                              <Badge className="ml-2 text-xs" variant="outline">
                                {(prediction.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(prediction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="pl-5 mb-2">
                        <div className="text-sm text-muted-foreground">{prediction.recommendation}</div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Brain className="h-3 w-3 mr-1 text-purple-400" />
                          <span>{prediction.model}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {prediction.applied && (
                            <div className="flex items-center text-green-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              <span>Applied</span>
                            </div>
                          )}
                          
                          {prediction.verified && (
                            <div className="flex items-center text-purple-400">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
          
          {/* Models tab */}
          <TabsContent value="models">
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 text-sm font-medium">
                ORA RMS AI Model Performance
              </div>
              
              <div className="divide-y divide-border/30">
                {modelPerformance.map((model, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Brain className={`h-4 w-4 mr-2 ${index === 0 ? 'text-purple-400' : 'text-muted-foreground'}`} />
                        <div className="font-medium">{model.name}</div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          model.accuracy > 90 
                            ? 'bg-green-500/10 text-green-400' 
                            : model.accuracy > 80 
                              ? 'bg-blue-500/10 text-blue-400' 
                              : 'bg-yellow-500/10 text-yellow-400'
                        } border-0`}
                      >
                        {model.accuracy}% accuracy
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <div className="text-muted-foreground text-xs">Latency</div>
                        <div>{model.latency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Cost Tier</div>
                        <div className={model.cost === "Lowest" ? "text-green-500" : model.cost === "Low" ? "text-blue-500" : "text-muted-foreground"}>
                          {model.cost}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Usage</div>
                        <div>{model.usage}%</div>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <Progress value={model.usage} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-purple-500/10 rounded-lg mt-4 text-xs text-purple-400">
              <div className="flex items-start">
                <BookOpen className="h-4 w-4 mr-2 mt-0.5" />
                <span>NexusArb automatically selects the optimal model based on market conditions, cost, and verification requirements. DeepSeek R1 offers the best balance of performance and cost for delta hedging.</span>
              </div>
            </div>
          </TabsContent>
          
          {/* Technical details tab */}
          {showTechnicalDetails && (
            <TabsContent value="technical">
              <div className="border border-border/30 rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 text-sm font-medium">
                  ORA RMS Integration Details
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">API Integration</h3>
                    <div className="p-3 bg-muted/20 rounded-md">
                      <pre className="text-xs overflow-x-auto">
{`// ORA RMS API Integration
const oraClient = new OraRMSClient({
  apiKey: process.env.ORA_API_KEY,
  endpoint: "https://api.ora.io/rms",
  verificationEnabled: true
});

// Example market analysis function
async function analyzeMarket() {
  const response = await oraClient.generateInference({
    model: "deepseek-r1",
    prompt: "Analyze current market conditions for ETH...",
    parameters: {
      temperature: 0.2,
      max_tokens: 1024
    },
    verification: {
      generateProof: true,
      onchainRecord: true
    }
  });
  
  return {
    prediction: response.output,
    confidence: response.metadata.confidence,
    verificationProof: response.verification.proof
  };
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Verification Process</h3>
                    <div className="p-3 border border-border/20 rounded-md bg-background/30">
                      <ol className="text-xs text-muted-foreground list-decimal pl-4 space-y-1">
                        <li>AI inference is executed on ORA RMS network</li>
                        <li>Cryptographic proof is generated for the inference</li>
                        <li>Proof is verified by multiple validators</li>
                        <li>Results are recorded on-chain with verification hash</li>
                        <li>DApp fetches verified results and proof</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Models & Capabilities</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-border/20 rounded-md bg-background/30">
                        <div className="font-medium mb-1">Market Analysis</div>
                        <div className="text-muted-foreground">DeepSeek R1, Llama 3.3 70B</div>
                      </div>
                      <div className="p-2 border border-border/20 rounded-md bg-background/30">
                        <div className="font-medium mb-1">Position Sizing</div>
                        <div className="text-muted-foreground">DeepSeek R1, Gemma 2 27B</div>
                      </div>
                      <div className="p-2 border border-border/20 rounded-md bg-background/30">
                        <div className="font-medium mb-1">Risk Assessment</div>
                        <div className="text-muted-foreground">Llama 3.3 70B, Qwen 2 72B</div>
                      </div>
                      <div className="p-2 border border-border/20 rounded-md bg-background/30">
                        <div className="font-medium mb-1">Funding Rate Strategy</div>
                        <div className="text-muted-foreground">DeepSeek R1, FLUX 1 Dev</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          >
            {showTechnicalDetails ? "Hide Technical Details" : "Show Technical Details"}
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <a href="https://docs.ora.io" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-sm">
              <ExternalLink className="h-3 w-3 mr-2" />
              ORA RMS Docs
            </Button>
          </a>
          
          <Button 
            variant="default" 
            onClick={runMarketAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run Market Analysis
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 