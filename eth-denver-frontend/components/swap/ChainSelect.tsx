import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChainSelectProps {
  chains: any[];
  selectedChain: any;
  onChainChange: (chain: any) => void;
}

export default function ChainSelect({ chains, selectedChain, onChainChange }: ChainSelectProps) {
  return (
    <Select 
      value={selectedChain.id.toString()} 
      onValueChange={(value) => onChainChange(chains.find(c => c.id === parseInt(value)))}
    >
      <SelectTrigger className="w-full h-14 bg-background/50">
        <SelectValue>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 ${selectedChain.color}`}>
              <span className="text-lg">{selectedChain.logo}</span>
            </div>
            <span>{selectedChain.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 ${chain.color}`}>
                <span>{chain.logo}</span>
              </div>
              <div className="font-medium">{chain.name}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}