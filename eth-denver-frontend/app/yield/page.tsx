"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Lock, Clock, Shield } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function YieldPage() {
  const { walletAddress, isConnecting, connectWallet } = useWallet();
  
  const yieldOptions = [
    {
      name: "Flexible Yield",
      apy: "8.5%",
      lockPeriod: "No lock",
      minAmount: "100",
      description: "Earn yields with no lock-up period. Withdraw anytime.",
      icon: TrendingUp
    },
    {
      name: "High Yield",
      apy: "12.5%",
      lockPeriod: "30 days",
      minAmount: "500",
      description: "Higher yields with a 30-day lock period.",
      icon: Lock
    },
    {
      name: "Premium Yield",
      apy: "18.5%",
      lockPeriod: "90 days",
      minAmount: "1,000",
      description: "Maximum yields with a 90-day lock period.",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Yield Options</h1>
          <p className="text-xl text-muted-foreground">
            Choose your preferred yield strategy based on your investment goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {yieldOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Lock Period: {option.lockPeriod}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {option.apy} APY
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Min. Amount: ${option.minAmount}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {option.description}
                </p>
                
                <Button
                  className="w-full"
                  onClick={walletAddress ? () => {} : connectWallet}
                >
                  {walletAddress ? "Start Earning" : "Connect Wallet"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 