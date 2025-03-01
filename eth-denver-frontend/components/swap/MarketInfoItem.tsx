import { motion } from "framer-motion";

interface MarketInfoItemProps {
  token: {
    id: number;
    symbol: string;
    name: string;
    price: number;
    logo: string;
  };
  marketData: {
    id: number;
    change: string;
  };
  index: number;
}

export default function MarketInfoItem({ token, marketData, index }: MarketInfoItemProps) {
  const isPositive = marketData.change.startsWith('+');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/30"
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
          <span className="text-lg">{token.logo}</span>
        </div>
        <div>
          <div className="font-medium">{token.symbol}</div>
          <div className="text-xs text-muted-foreground">{token.name}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-medium">${token.price.toLocaleString()}</div>
        <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {marketData.change}
        </div>
      </div>
    </motion.div>
  );
}