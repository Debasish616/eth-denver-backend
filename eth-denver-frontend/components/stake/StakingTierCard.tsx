import { Check } from "lucide-react";

interface StakingTierProps {
  tier: {
    id: number;
    name: string;
    minStake: number;
    apy: number;
    lockPeriod: number;
    benefits: string[];
  };
  isSelected: boolean;
  onSelect: (tier: any) => void;
}

export default function StakingTierCard({ tier, isSelected, onSelect }: StakingTierProps) {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-primary/20 border-primary shadow-glow-blue' 
          : 'bg-background/50 border-border/30 hover:bg-background/70'
      }`}
      onClick={() => onSelect(tier)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{tier.name}</h3>
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="text-2xl font-bold text-gradient-blue-purple mb-2">
        {tier.apy}% <span className="text-sm font-normal text-muted-foreground">APY</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Mina: ${tier.minStake.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">
        {tier.lockPeriod > 0 
          ? `${tier.lockPeriod}-day lock` 
          : 'No lock period'}
      </div>
    </div>
  );
}