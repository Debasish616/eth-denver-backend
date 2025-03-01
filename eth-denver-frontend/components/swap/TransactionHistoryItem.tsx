import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Globe, ArrowRight } from "lucide-react";

interface TransactionHistoryItemProps {
  tx: {
    id: number;
    type: string;
    from: string;
    to: string;
    amount: string;
    value: string;
    time: string;
    status: string;
    fromChain?: string;
    toChain?: string;
  };
  index: number;
}

export default function TransactionHistoryItem({ tx, index }: TransactionHistoryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-2">
        <Badge variant="outline" className={tx.type === "swap" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}>
          {tx.type === "swap" ? (
            <ArrowDownUp className="h-3 w-3 mr-1" />
          ) : (
            <Globe className="h-3 w-3 mr-1" />
          )}
          {tx.type === "swap" ? "Swap" : "Bridge"}
        </Badge>
        <span className="text-xs text-muted-foreground">{tx.time}</span>
      </div>
      
      <div className="flex items-center text-sm">
        <div className="flex items-center">
          <span className="font-medium">{tx.amount} {tx.from}</span>
          <ArrowRight className="h-3 w-3 mx-1" />
          <span className="font-medium">{tx.amount} {tx.to}</span>
        </div>
      </div>
      
      {tx.type === "bridge" && tx.fromChain && tx.toChain && (
        <div className="text-xs text-muted-foreground mt-1">
          {tx.fromChain} → {tx.toChain}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">Value: ${tx.value}</span>
        <Badge variant="outline" className="bg-green-500/20 text-green-400 text-xs">
          {tx.status}
        </Badge>
      </div>
    </motion.div>
  );
}