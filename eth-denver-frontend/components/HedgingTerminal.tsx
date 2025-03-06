'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { simulateHedgingTerminal } from '@/utils/simulateHedging';

interface HedgingTerminalProps {
  isVisible: boolean;
  fromToken: 'USDC' | 'USDT';
  amount: number;
  onClose: () => void;
}

export function HedgingTerminal({ isVisible, fromToken, amount, onClose }: HedgingTerminalProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      // Generate terminal output when component becomes visible
      const lines = simulateHedgingTerminal({ fromToken, amount });
      setTerminalLines(lines);
      setCurrentLineIndex(0);
      setIsTyping(true);
    } else {
      // Reset when hidden
      setTerminalLines([]);
      setCurrentLineIndex(0);
      setIsTyping(false);
    }
  }, [isVisible, fromToken, amount]);

  useEffect(() => {
    // Simulate typing effect by showing lines progressively
    if (isTyping && currentLineIndex < terminalLines.length) {
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        
        // Scroll to bottom of terminal
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, calculateDelay(terminalLines[currentLineIndex]));
      
      return () => clearTimeout(timer);
    } else if (currentLineIndex >= terminalLines.length) {
      setIsTyping(false);
    }
  }, [currentLineIndex, isTyping, terminalLines]);

  // Calculate delay based on line length (faster for shorter lines)
  const calculateDelay = (line: string) => {
    if (!line || line.trim() === '') return 300;
    if (line.startsWith('[STATUS]')) return 800; // Pause longer on status messages
    if (line.startsWith('[PORTFOLIO]')) return 700;
    if (line.includes('---')) return 200; // Fast for dividers
    return Math.min(100 + line.length * 5, 500); // Between 100ms and 500ms based on length
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-4xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
          >
            <Card className="border-gray-800 bg-black">
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-green-500" />
                  <span className="font-mono text-green-500 font-semibold">Delta-Neutral Hedging Engine</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Close
                </Button>
              </div>
              <CardContent className="p-0">
                <div 
                  ref={terminalRef}
                  className="bg-black text-green-500 font-mono text-sm p-4 h-[500px] overflow-y-auto"
                >
                  {terminalLines.slice(0, currentLineIndex).map((line, index) => (
                    <div key={index} className="terminal-line">
                      {line === '' ? <br /> : renderTerminalLine(line)}
                    </div>
                  ))}
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper function to colorize different parts of the terminal output
function renderTerminalLine(line: string) {
  if (line.startsWith('[INFO]')) {
    return <span className="text-blue-400">{line}</span>;
  } else if (line.startsWith('[ANALYSIS]')) {
    return <span className="text-yellow-400">{line}</span>;
  } else if (line.startsWith('[STRATEGY]')) {
    return <span className="text-purple-400">{line}</span>;
  } else if (line.startsWith('[EXECUTION]')) {
    return <span className="text-orange-400">{line}</span>;
  } else if (line.startsWith('[PORTFOLIO]')) {
    return <span className="text-cyan-400">{line}</span>;
  } else if (line.startsWith('[STATUS]')) {
    return <span className="text-green-600 font-bold">{line}</span>;
  } else if (line.startsWith('[HEALTH]')) {
    return <span className="text-teal-400">{line}</span>;
  } else if (line.includes('NexusArb')) {
    return <span className="text-white font-bold">{line}</span>;
  } else if (line.startsWith('  •')) {
    return <span className="text-gray-300">{line}</span>;
  } else if (line.includes('---')) {
    return <span className="text-gray-600">{line}</span>;
  } else {
    return line;
  }
} 