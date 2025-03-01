import { motion } from "framer-motion";
import { Activity, Check, AlertTriangle, X, Zap } from "lucide-react";
import { getLogTypeColor } from "@/utils/formatters";

interface AILogItemProps {
  log: {
    id: number;
    message: string;
    type: string;
    time: string;
  };
}

export default function AILogItem({ log }: AILogItemProps) {
  // Log type icon mapping
  const getLogTypeIcon = (type: string) => {
    switch(type) {
      case 'info': return <Activity className="h-4 w-4" />;
      case 'success': return <Check className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-2 text-sm"
    >
      <div className="flex items-start">
        <div className={`mt-0.5 mr-2 ${getLogTypeColor(log.type)}`}>
          {getLogTypeIcon(log.type)}
        </div>
        <div>
          <span className={`${getLogTypeColor(log.type)}`}>{log.message}</span>
          <span className="text-xs text-muted-foreground ml-2">{log.time}</span>
        </div>
      </div>
    </motion.div>
  );
}