"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign, 
  Scale, 
  Activity, 
  Clock, 
  RefreshCw, 
  ArrowUpRight 
} from "lucide-react"

export default function ProtocolHedgingStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-400" />
            Total Value Hedged
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">$14.7M</span>
            <Badge className="ml-2 bg-green-500/10 text-green-400 border-0">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span className="text-xs">7.2%</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all volatile assets</p>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Scale className="h-4 w-4 mr-2 text-blue-400" />
            Net Delta Exposure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">0.003</span>
            <span className="text-sm ml-1 text-muted-foreground">Δ</span>
          </div>
          <div className="mt-2">
            <Progress value={50.3} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>-0.1</span>
              <span>Neutral</span>
              <span>+0.1</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2 text-purple-400" />
            Hedge Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">99.7%</span>
            <Badge className="ml-2 bg-purple-500/10 text-purple-400 border-0">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span className="text-xs">0.2%</span>
            </Badge>
          </div>
          <div className="mt-1">
            <Progress value={99.7} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>95%</span>
              <span>Target: 99.5%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-yellow-400" />
            Last Rebalance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">14m 22s</span>
            <span className="text-xs text-muted-foreground ml-2">ago</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Next expected in ~16min</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 