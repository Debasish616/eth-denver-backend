interface StakingStatsItemProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

export default function StakingStatsItem({ label, value, valueClassName = "font-medium" }: StakingStatsItemProps) {
  return (
    <div className="flex justify-between items-center p-3 rounded-md bg-background/50 border border-border/30">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}