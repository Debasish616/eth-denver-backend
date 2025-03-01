import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ExchangeItemProps {
  exchange: {
    id: number;
    name: string;
    type: string;
    status: string;
    apiHealth: number;
  };
}

export default function ExchangeItem({ exchange }: ExchangeItemProps) {
  return (
    <div 
      className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30"
    >
      <div>
        <div className="font-medium">{exchange.name}</div>
        <div className="text-xs text-muted-foreground">{exchange.type}</div>
      </div>
      
      <div className="flex items-center">
        {exchange.status === 'connected' ? (
          <Badge className="mr-2 bg-green-500/20 text-green-400 hover:bg-green-500/30">
            Connected
          </Badge>
        ) : (
          <Badge className="mr-2 bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Disconnected
          </Badge>
        )}
        
        <Switch 
          checked={exchange.status === 'connected'} 
          className={exchange.status === 'connected' ? "bg-green-500" : ""}
        />
      </div>
    </div>
  );
}