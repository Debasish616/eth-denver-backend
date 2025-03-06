"use client";

import { Button } from "@/components/ui/button";
import { Wallet, RefreshCw } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export function WalletButton() {
  const { walletAddress, isConnecting, connectWallet } = useWallet();

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-glow-blue"
    >
      {isConnecting ? (
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
} 