// Format time remaining in lock period
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Unlocked";
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

// Risk color mapping
export const getRiskColor = (risk: string): string => {
  switch(risk) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-green-400';
  }
};

// Log type color mapping
export const getLogTypeColor = (type: string): string => {
  switch(type) {
    case 'info': return 'text-blue-400';
    case 'success': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    case 'action': return 'text-purple-400';
    default: return 'text-muted-foreground';
  }
};