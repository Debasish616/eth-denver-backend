import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TokenSelectProps {
  tokens: any[];
  selectedToken: any;
  onTokenChange: (token: any) => void;
}

export default function TokenSelect({ tokens, selectedToken, onTokenChange }: TokenSelectProps) {
  return (
    <Select 
      value={selectedToken.id.toString()} 
      onValueChange={(value) => onTokenChange(tokens.find(t => t.id === parseInt(value)))}
    >
      <SelectTrigger className="w-[180px] h-14 bg-background/50">
        <SelectValue>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
              <span className="text-lg">{selectedToken.logo}</span>
            </div>
            <span>{selectedToken.symbol}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.id} value={token.id.toString()}>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span>{token.logo}</span>
              </div>
              <div>
                <div className="font-medium">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}