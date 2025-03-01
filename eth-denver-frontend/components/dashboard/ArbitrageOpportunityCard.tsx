import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { getRiskColor } from "@/utils/formatters";

interface ArbitrageOpportunityProps {
  opportunity: {
    id: number;
    pair: string;
    exchange1: string;
    price1: number;
    exchange2: string;
    price2: number;
    difference: number;
    percent: number;
    risk: string;
    estimatedTime: string;
  };
  isTrading: boolean;
}

export default function ArbitrageOpportunityCard({ opportunity, isTrading }: ArbitrageOpportunityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg bg-background/50 border border-border/30 hover:shadow-glow-blue transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">{opportunity.pair}</span>
        <span className="text-green-400 font-medium">
          +{opportunity.percent.toFixed(2)}%
        </span>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground mb-3">
        <span>{opportunity.exchange1} → {opportunity.exchange2}</span>
        <span>${opportunity.difference.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center text-xs mb-3">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-1">Buy at</span>
          <span className="font-medium">${opportunity.price1.toFixed(2)}</span>
        </div>
        
        <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground mb-1">Sell at</span>
          <span className="font-medium">${opportunity.price2.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs mb-3">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">Est. time: {opportunity.estimatedTime}</span>
        </div>
        
        <div className={`flex items-center ${getRiskColor(opportunity.risk)}`}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="capitalize">{opportunity.risk} risk</span>
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
  );
}