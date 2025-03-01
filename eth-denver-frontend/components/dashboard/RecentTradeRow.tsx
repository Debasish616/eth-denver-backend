import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RecentTradeProps {
  trade: {
    id: number;
    pair: string;
    exchange1: string;
    exchange2: string;
    profit: number;
    time: string;
    profitPercent: number;
    isProfit: boolean;
    executionTime: string;
    fees: number;
  };
  index: number;
}

export default function RecentTradeRow({ trade, index }: RecentTradeProps) {
  return (
    <motion.tr 
      key={trade.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border-b border-border/20 hover:bg-background/40"
    >
      <td className="py-3 px-4 font-medium">{trade.pair}</td>
      <td className="py-3 px-4 text-muted-foreground">
        {trade.exchange1} → {trade.exchange2}
      </td>
      <td className={`py-3 px-4 text-right font-medium ${trade.isProfit ? 'text-green-400' : 'text-red-400'}`}>
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
  );
}