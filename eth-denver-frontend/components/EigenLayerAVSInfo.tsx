"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Shield, Activity, CheckCircle, AlertTriangle, Server, RefreshCw, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Operator {
  id: string
  name: string
  stake: number
  status: "active" | "validating" | "slashed"
  lastVerification: string
}

export default function EigenLayerAVSInfo() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([
    { 
      id: "op1", 
      name: "Delta Validator 1", 
      stake: 32.5, 
      status: "active", 
      lastVerification: "10 minutes ago" 
    },
    { 
      id: "op2", 
      name: "NeutralNode", 
      stake: 48.2, 
      status: "active", 
      lastVerification: "3 minutes ago" 
    },
    { 
      id: "op3", 
      name: "EigenStaker_76", 
      stake: 16.1, 
      status: "active", 
      lastVerification: "22 minutes ago" 
    },
    { 
      id: "op4", 
      name: "HedgeVerifier", 
      stake: 24.7, 
      status: "active", 
      lastVerification: "5 minutes ago" 
    }
  ])

  const requestVerification = () => {
    setIsVerifying(true)
    setVerificationProgress(0)
    setVerificationComplete(false)
    
    // Simulate verification progress
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(interval)
          
          // Update operator statuses
          setTimeout(() => {
            setOperators(prev => prev.map(op => ({
              ...op,
              status: "active",
              lastVerification: "just now"
            })))
            
            setVerificationComplete(true)
            setIsVerifying(false)
          }, 500)
          
          return 100
        }
        
        // Switch some operators to validating status
        if (newProgress > 20 && newProgress < 80) {
          setOperators(prev => prev.map((op, idx) => ({
            ...op,
            status: idx % 2 === 0 ? "validating" : op.status
          })))
        }
        
        return newProgress
      })
    }, 300)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400"
      case "validating": return "text-blue-400"
      case "slashed": return "text-red-400"
      default: return "text-muted-foreground"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10"
      case "validating": return "bg-blue-500/10"
      case "slashed": return "bg-red-500/10"
      default: return "bg-muted/10"
    }
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-400" />
              EigenLayer AVS Integration
            </CardTitle>
            <CardDescription>
              Decentralized verification of delta-neutral positions
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-3 py-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
                    <span>Mainnet Alpha</span>
                  </div>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Our Delta-Neutral Hedging AVS is currently in alpha testing on EigenLayer's mainnet infrastructure
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AVS Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Server className="h-4 w-4 mr-2 text-indigo-400" />
                Active Operators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operators.length}</div>
              <p className="text-xs text-muted-foreground">Verifying delta neutrality</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Lock className="h-4 w-4 mr-2 text-indigo-400" />
                ETH Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {operators.reduce((sum, op) => sum + op.stake, 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Securing verification</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-indigo-400" />
                Verification Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2/hr</div>
              <p className="text-xs text-muted-foreground">Average verifications</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                Last Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {verificationComplete ? "Just now" : "3m 45s"}
              </div>
              <p className="text-xs text-muted-foreground">Ago</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Operator List */}
        <div className="border border-border/30 rounded-lg overflow-hidden">
          <div className="bg-muted/30 px-4 py-3 text-sm font-medium">
            Active EigenLayer Operators
          </div>
          <div className="divide-y divide-border/30">
            {operators.map((operator) => (
              <div key={operator.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusBg(operator.status)} mr-3`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(operator.status)} ${operator.status === "validating" ? "animate-pulse" : ""}`}></div>
                  </div>
                  <div>
                    <div className="font-medium">{operator.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span>{operator.stake} ETH staked</span>
                      <span className="mx-2">•</span>
                      <span>Last verified: {operator.lastVerification}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusBg(operator.status)} border-0 ${getStatusColor(operator.status)}`}
                >
                  {operator.status === "active" && "Active"}
                  {operator.status === "validating" && "Validating"}
                  {operator.status === "slashed" && "Slashed"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Verification Status */}
        {(isVerifying || verificationComplete) && (
          <div className="p-4 border border-border/30 rounded-lg bg-background/50">
            <div className="flex items-center mb-2">
              {isVerifying ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-400 animate-spin" />
                  <h3 className="font-medium">Verification in progress...</h3>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  <h3 className="font-medium">Verification complete</h3>
                </>
              )}
            </div>
            
            {isVerifying && (
              <div className="space-y-2">
                <Progress value={verificationProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {verificationProgress < 20 && "Submitting verification request to EigenLayer network..."}
                  {verificationProgress >= 20 && verificationProgress < 50 && "Operators validating hedging positions across venues..."}
                  {verificationProgress >= 50 && verificationProgress < 80 && "Checking delta calculations and neutral exposure..."}
                  {verificationProgress >= 80 && "Finalizing consensus and generating proof..."}
                </p>
              </div>
            )}
            
            {verificationComplete && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-border/20 rounded-md bg-background/30">
                    <div className="text-sm font-medium mb-1">Delta Exposure</div>
                    <div className="text-xl font-bold flex items-baseline">
                      0.004 <span className="text-sm ml-1 text-muted-foreground">Δ</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Within neutral threshold
                    </div>
                  </div>
                  
                  <div className="p-3 border border-border/20 rounded-md bg-background/30">
                    <div className="text-sm font-medium mb-1">Consensus</div>
                    <div className="text-xl font-bold">100%</div>
                    <div className="text-xs text-green-400 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All operators in agreement
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Verification hash: 0x7f4e6c21a48ba2e7e607742b93a73d1cb2f308e17889e5982eb35c5a1f9c4d7b
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="default" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          disabled={isVerifying}
          onClick={requestVerification}
        >
          {isVerifying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Request AVS Verification
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 