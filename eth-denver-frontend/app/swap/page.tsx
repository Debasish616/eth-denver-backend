"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownUp, 
  ArrowRight, 
  Settings, 
  RefreshCw, 
  Info, 
  ChevronDown,
  Zap,
  Globe,
  AlertTriangle,
  Wallet,
  ExternalLink,
  BarChart4,
  Shield,
  Lock,
  Plus,
} from "lucide-react";
import Image from "next/image";
import TokenSelect from "@/components/swap/TokenSelect";
import TransactionHistoryItem from "@/components/swap/TransactionHistoryItem";
import ChainSelect from "@/components/swap/ChainSelect";
import MarketInfoItem from "@/components/swap/MarketInfoItem";
import { useWallet } from "@/context/WalletContext";

// Import ethers v6
import { 
  ethers, 
  Contract, 
  formatEther, 
  formatUnits, 
  parseEther, 
  parseUnits 
} from "ethers";

// Define types for our app
declare global {
  interface Window {
    ethereum: any;
  }
}

// Mock data for tokens - With Sepolia testnet addresses
// We'll fetch the actual addresses from our deployment file
let tokens = [
  { id: 1, symbol: "NUSD", name: "Nova USD", balance: 0, price: 1.00, logo: "💲", isNUSD: true, decimals: 18, address: "" },
  { id: 2, symbol: "USDC", name: "USD Coin", balance: 0, price: 1.00, logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", isNUSD: false, decimals: 6, address: "" },
  { id: 3, symbol: "USDT", name: "Tether USD", balance: 0, price: 1.00, logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png", isNUSD: false, decimals: 6, address: "" },
  { id: 4, symbol: "coreBTC", name: "CoreBTC", balance: 0, price: 60000.00, logo: "₿", isNUSD: false, decimals: 18, address: "" },
];

// Mock data for chains
const chains = [
  { id: 1, name: "CoreDAO", logo: "Ξ", color: "text-blue-400" },
  { id: 2, name: "Ethereum", logo: "◎", color: "text-purple-400" },
  { id: 3, name: "Arbitrum", logo: "🔺", color: "text-red-400" },
  { id: 4, name: "Optimism", logo: "⬡", color: "text-purple-500" },
  { id: 5, name: "Base", logo: "⛓️", color: "text-yellow-400" },
  { id: 6, name: "Polygon", logo: "🔷", color: "text-blue-500" },
];

// Fixed market data to prevent hydration errors
const marketData = [
  { id: 1, change: "+2.45%" },
  { id: 2, change: "-1.32%" },
  { id: 3, change: "+3.87%" },
  { id: 4, change: "-0.92%" },
];

// Fixed transaction history to prevent hydration errors
const transactionHistory = [
  { 
    id: 1,
    type: "swap", 
    from: "coreBTC", 
    to: "NUSD", 
    amount: "0.5", 
    value: "1,622.84", 
    time: "2 mins ago",
    status: "completed"
  },
  { 
    id: 2,
    type: "bridge", 
    from: "NUSD", 
    to: "NUSD", 
    amount: "500", 
    value: "500", 
    time: "1 hour ago",
    status: "completed",
    fromChain: "CoreDAO",
    toChain: "Ethereum"
  },
  { 
    id: 3,
    type: "swap", 
    from: "USDC", 
    to: "NUSD", 
    amount: "1000", 
    value: "1,046.92", 
    time: "3 hours ago",
    status: "completed"
  },
  { 
    id: 4,
    type: "bridge", 
    from: "NUSD", 
    to: "NUSD", 
    amount: "1500", 
    value: "1,536.75", 
    time: "1 day ago",
    status: "completed",
    fromChain: "CoreDAO",
    toChain: "Arbitrum"
  },
];

export default function SwapPage() {
  const [mode, setMode] = useState("swap"); // "swap" or "bridge"
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("0.03");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [fromChain, setFromChain] = useState(chains[0]);
  const [toChain, setToChain] = useState(chains[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [gasFee, setGasFee] = useState("2.45");
  const [bridgeFee, setBridgeFee] = useState("0.1");
  const [estimatedTime, setEstimatedTime] = useState("2-5 minutes");
  const [clientReady, setClientReady] = useState(false);
  const [addingTokenToWallet, setAddingTokenToWallet] = useState("");
  
  // Use wallet context instead of local state
  const { walletAddress: connectedAccount, isConnecting, connectWallet, signer, getContract } = useWallet();
  
  // Contract states
  const [swapContract, setSwapContract] = useState<Contract | null>(null);
  const [nusdContract, setNusdContract] = useState<Contract | null>(null);
  const [tokenContracts, setTokenContracts] = useState<Record<string, any>>({});
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [tokensWithBalances, setTokensWithBalances] = useState(tokens);
  const [swapDirection, setSwapDirection] = useState('mint'); // 'mint' or 'burn'
  
  const [networkReady, setNetworkReady] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Chain ID for Sepolia in hex
  
  // Add faucet contract state
  const [faucetContract, setFaucetContract] = useState<Contract | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState("");
  
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);
  
  // Set client-ready state to prevent hydration errors
  useEffect(() => {
    setClientReady(true);
  }, []);
  
  // Calculate to amount based on from amount and token prices
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const fromValue = parseFloat(fromAmount) * fromToken.price;
      const toValue = fromValue / toToken.price;
      setToAmount(toValue.toFixed(toToken.symbol === "nUSD" ? 2 : 6));
    }
  }, [fromAmount, fromToken, toToken]);
  
  // Replace your handleTokenChange with this updated version
  const handleTokenChange = (type: 'from' | 'to', newToken: typeof tokens[number] | undefined) => {
    if (!newToken) return;
    
    if (type === 'from') {
      setFromToken(newToken);
      
      // If changing from token, automatically set the destination token
      if (newToken.isNUSD) {
        // If selecting NUSD as from, we're burning NUSD to get collateral
        setSwapDirection('burn');
        // Find a non-NUSD token for the to field
        const defaultToToken = tokens.find(t => !t.isNUSD);
        if (defaultToToken) {
          setToToken(defaultToToken);
        }
      } else {
        // If selecting collateral as from, we're minting NUSD
        setSwapDirection('mint');
        // Find the NUSD token for the to field
        const nusdToken = tokens.find(t => t.isNUSD);
        if (nusdToken) {
          setToToken(nusdToken);
        }
      }
    } else {
      setToToken(newToken);
      
      // If changing to token, automatically set the source token based on swap direction
      if (newToken.isNUSD) {
        // If selecting NUSD as to, we're minting NUSD from collateral
        setSwapDirection('mint');
        // If the from token is currently NUSD, change it to a non-NUSD token
        if (fromToken.isNUSD) {
          const defaultFromToken = tokens.find(t => !t.isNUSD);
          if (defaultFromToken) {
            setFromToken(defaultFromToken);
          }
        }
      } else {
        // If selecting collateral as to, we're burning NUSD
        setSwapDirection('burn');
        // Find the NUSD token for the from field
        const nusdToken = tokens.find(t => t.isNUSD);
        if (nusdToken) {
          setFromToken(nusdToken);
        }
      }
    }
  };
  
  // Replace your handleSwapTokens with this function
  const handleSwapTokens = () => {
    // Toggle between mint and burn mode
    if (swapDirection === 'mint') {
      setSwapDirection('burn');
      const nusdToken = tokens.find(t => t.isNUSD);
      const nonNusdToken = tokens.find(t => !t.isNUSD);
      
      if (nusdToken) {
        setFromToken(nusdToken);
      }
      
      if (nonNusdToken) {
        setToToken(nonNusdToken);
      }
    } else {
      setSwapDirection('mint');
      const nusdToken = tokens.find(t => t.isNUSD);
      const nonNusdToken = tokens.find(t => !t.isNUSD);
      
      if (nonNusdToken) {
        setFromToken(nonNusdToken);
      }
      
      if (nusdToken) {
        setToToken(nusdToken);
      }
    }
    setFromAmount("");
    setToAmount("");
  };
  
  // Add a function to calculate equivalent amount
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      return;
    }
    
    setIsLoading(true);
    
    // Calculate amount based on prices and decimals
    const calculateAmount = () => {
      if (swapDirection === 'mint') {
        // Calculate NUSD amount based on collateral value
        const collateralValue = parseFloat(fromAmount) * fromToken.price;
        setToAmount(collateralValue.toFixed(2));
      } else {
        // Calculate collateral amount based on NUSD value
        const collateralAmount = parseFloat(fromAmount) / toToken.price;
        setToAmount(collateralAmount.toFixed(toToken.decimals === 18 ? 6 : (toToken.decimals === 8 ? 8 : 2)));
      }
      setIsLoading(false);
    };
    
    // Add a small delay to simulate API call
    const timer = setTimeout(calculateAmount, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, swapDirection]);

  // Load deployment info for contract addresses
  useEffect(() => {
    const loadDeploymentInfo = async () => {
      try {
        const response = await fetch('/deployments/sepolia.json');
        if (!response.ok) {
          throw new Error(`Failed to load deployment info: ${response.status}`);
        }
        const data = await response.json();
        console.log("Loaded deployment info:", data);
        setDeploymentInfo(data);
        
        // Update token addresses from deployment
        const updatedTokens = tokens.map(token => {
          if (token.symbol === "NUSD") {
            return { ...token, address: data.nusd };
          } else if (token.symbol === "USDC") {
            return { ...token, address: data.tokens.usdc };
          } else if (token.symbol === "USDT") {
            return { ...token, address: data.tokens.usdt };
          } else if (token.symbol === "WBTC") {
            return { ...token, address: data.tokens.wbtc };
          } else if (token.symbol === "WETH") {
            return { ...token, address: data.tokens.weth };
          }
          return token;
        });
        
        tokens = updatedTokens;
        setTokensWithBalances(updatedTokens);
        
      } catch (error) {
        console.error("Error loading deployment info:", error);
      }
    };
    
    loadDeploymentInfo();
  }, []);

  // Update the useEffect to fetch balances more reliably
  useEffect(() => {
    const initializeContracts = async () => {
      if (!connectedAccount || !signer || !networkReady || !deploymentInfo) {
        console.log("Cannot initialize contracts - prerequisites not met");
        return;
      }
      
      try {
        console.log("Initializing contracts with addresses from deployment...");
        
        // Get contract addresses from deployment info
        const swapContractAddress = deploymentInfo.swapForNUSD;
        const nusdContractAddress = deploymentInfo.nusd;
        
        console.log("Using addresses:", {
          swap: swapContractAddress,
          nusd: nusdContractAddress,
          usdc: deploymentInfo.tokens.usdc,
          usdt: deploymentInfo.tokens.usdt,
          wbtc: deploymentInfo.tokens.wbtc,
          weth: deploymentInfo.tokens.weth
        });
        
        // Get contract instances
        const swap = getContract(swapContractAddress, SWAP_FOR_NUSD_ABI);
        setSwapContract(swap);
        
        const nusd = getContract(nusdContractAddress, NUSD_ABI);
        setNusdContract(nusd);
        
        // Initialize token contracts
        const contracts: Record<string, any> = {};
        const balances: Record<string, number> = {};
        
        // Initialize token contracts and fetch balances
        for (const token of tokens) {
          try {
            if (!token.address) {
              console.warn(`No address for ${token.symbol}, skipping`);
              continue;
            }
            
            console.log(`Initializing ${token.symbol} contract at ${token.address}`);
            const tokenContract = getContract(token.address, token.isNUSD ? NUSD_ABI : ERC20_ABI);
            if (tokenContract) {
              contracts[token.symbol] = tokenContract;
              
              // Get token balance with proper error handling
              try {
                const tokenBalance = await tokenContract.balanceOf(connectedAccount);
                const tokenDecimals = await tokenContract.decimals();
                balances[token.symbol] = parseFloat(formatUnits(tokenBalance, tokenDecimals));
                console.log(`Fetched ${token.symbol} balance:`, balances[token.symbol]);
              } catch (error) {
                console.warn(`Error fetching ${token.symbol} balance:`, error);
                balances[token.symbol] = 0;
              }
            }
          } catch (error) {
            console.warn(`Error initializing ${token.symbol} contract:`, error);
          }
        }
        
        // Update token array with balances
        const updatedTokens = tokens.map(token => ({
          ...token,
          balance: balances[token.symbol] || 0
        }));
        
        console.log("Updated tokens with balances:", updatedTokens);
        setTokenContracts(contracts);
        setTokenBalances(balances);
        setTokensWithBalances(updatedTokens);
        
        // Force UI refresh
        setClientReady(false);
        setTimeout(() => setClientReady(true), 100);
      } catch (error) {
        console.error("Error initializing contracts:", error);
      }
    };
    
    if (connectedAccount && networkReady && deploymentInfo) {
      initializeContracts();
      
      // Set up interval to refresh balances every 15 seconds
      const intervalId = setInterval(() => {
        updateTokenBalances();
      }, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [connectedAccount, signer, getContract, networkReady, deploymentInfo]);
  
  // Simulate loading when changing tokens
  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Update the connectWallet function to check and switch network
  const switchToSepoliaNetwork = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return false;
    }
    
    try {
      // First try to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network to MetaMask:', addError);
          alert('Could not add Sepolia network to MetaMask. Please add it manually.');
          return false;
        }
      }
      console.error('Error switching to Sepolia network:', switchError);
      alert('Failed to switch to Sepolia network. Please switch manually.');
      return false;
    }
  };
  
  // Function to ensure the correct network
  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        const success = await switchToSepoliaNetwork();
        if (success) {
          setNetworkReady(true);
          return true;
        } else {
          setNetworkReady(false);
          return false;
        }
      } else {
        setNetworkReady(true);
        return true;
      }
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkReady(false);
      return false;
    }
  };
  
  // Listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        setCurrentChainId(chainId);
        setNetworkReady(chainId === SEPOLIA_CHAIN_ID);
        
        // Reload page on chain change as recommended by MetaMask
        window.location.reload();
      });
    }
    
    // Check network on initial load
    ensureCorrectNetwork();
    
    return () => {
      // Clean up listener
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);
  
  // Check and request network switch when connecting wallet
  const connectWalletAndSetupNetwork = async () => {
    const networkSuccess = await ensureCorrectNetwork();
    if (networkSuccess) {
      connectWallet();
    }
  };
  
  // Add function to get testnet ETH from faucet
  const openSepoliaFaucet = () => {
    window.open('https://sepoliafaucet.com/', '_blank');
  };
  
  // Update token address and contract initialization for Sepolia
  useEffect(() => {
    const initializeContracts = async () => {
      if (!connectedAccount || !signer || !networkReady || !deploymentInfo) return;
      
      try {
        // Get contract addresses from deployment info
        const swapContractAddress = deploymentInfo.swapForNUSD;
        const nusdContractAddress = deploymentInfo.nusd;
        
        // Get contract instances
        const swap = getContract(swapContractAddress, SWAP_FOR_NUSD_ABI);
        setSwapContract(swap);
        
        const nusd = getContract(nusdContractAddress, NUSD_ABI);
        setNusdContract(nusd);
        
        // Initialize token contracts
        const contracts: Record<string, any> = {};
        const balances: Record<string, number> = {};
        
        // Initialize NUSD balance
        if (nusd) {
          try {
            const nusdBalance = await nusd.balanceOf(connectedAccount);
            balances["NUSD"] = parseFloat(formatEther(nusdBalance));
          } catch (error) {
            console.warn("Error fetching NUSD balance:", error);
            balances["NUSD"] = 0;
          }
        }
        
        // Load token contracts and balances
        for (const token of tokens.filter(t => !t.isNUSD)) {
          try {
            if (!token.address) {
              console.warn(`No address for ${token.symbol}, skipping`);
              continue;
            }
            
            const tokenContract = getContract(token.address, ERC20_ABI);
            if (tokenContract) {
              contracts[token.symbol] = tokenContract;
              
              // Get token balance with proper error handling
              try {
                const tokenBalance = await tokenContract.balanceOf(connectedAccount);
                const tokenDecimals = await tokenContract.decimals();
                balances[token.symbol] = parseFloat(formatUnits(tokenBalance, tokenDecimals));
              } catch (error) {
                console.warn(`Error fetching ${token.symbol} balance:`, error);
                balances[token.symbol] = 0;
              }
            }
          } catch (error) {
            console.warn(`Error initializing ${token.symbol} contract:`, error);
          }
        }
        
        // Update token array with balances
        const updatedTokens = tokens.map(token => ({
          ...token,
          balance: balances[token.symbol] || 0
        }));
        
        setTokenContracts(contracts);
        setTokenBalances(balances);
        setTokensWithBalances(updatedTokens);
      } catch (error) {
        console.error("Error initializing contracts:", error);
      }
    };
    
    initializeContracts();
  }, [connectedAccount, signer, getContract, networkReady, deploymentInfo]);
  
  // Add contract owner/admin address with permissions to mint tokens
  const FAUCET_ADMIN_ADDRESS = "0x075C971c46876e5929ADb33dd7331C63e901F347"; // The deployer address from the deployment output
  
  // Function to mint test tokens using deployed contracts
  const mintTestToken = async (token: typeof tokens[number]) => {
    if (!connectedAccount || !signer) {
      alert("Please connect your wallet first!");
      return;
    }
    
    // Prevent direct minting of NUSD
    if (token.isNUSD) {
      alert("NUSD cannot be minted directly. Please mint other tokens (USDC, USDT, WBTC, WETH) and then use the Swap interface to mint NUSD with these tokens as collateral.");
      return;
    }
    
    if (!networkReady) {
      const switched = await ensureCorrectNetwork();
      if (!switched) {
        alert("Please switch to Sepolia testnet to continue.");
        return;
      }
    }
    
    if (!token.address) {
      alert(`No contract address found for ${token.symbol}. Make sure deployment info is loaded.`);
      return;
    }
    
    setIsMinting(true);
    setAddingTokenToWallet(token.symbol);
    setTxStatus("");
    
    try {
      // First ensure token is added to wallet
      await addTokenToMetaMask(token);
      
      // Get token contract with the TestToken interface
      const tokenContract = new ethers.Contract(token.address, [
        "function mint(address to, uint256 amount) public returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function lastMintTime(address account) view returns (uint256)",
        "function mintLimit() view returns (uint256)",
        "function mintCooldown() view returns (uint256)"
      ], signer);
      
      // Get token decimals
      let decimals;
      try {
        decimals = await tokenContract.decimals();
      } catch (error) {
        console.error("Error getting decimals:", error);
        throw new Error(`No contract deployed at ${token.address} with required functions.`);
      }
      
      // Calculate amount - 100 tokens with proper decimals
      const amount = parseUnits("100", decimals);
      
      // Check if the user is within the cooldown period
      try {
        const lastMintTime = await tokenContract.lastMintTime(connectedAccount);
        const mintCooldown = await tokenContract.mintCooldown();
        const now = Math.floor(Date.now() / 1000); // Convert to seconds
        
        if (lastMintTime.toString() !== "0" && now < Number(lastMintTime) + Number(mintCooldown)) {
          const cooldownRemaining = (Number(lastMintTime) + Number(mintCooldown)) - now;
          const minutes = Math.ceil(cooldownRemaining / 60);
          throw new Error(`Cooldown period not passed. Please try again in ${minutes} minutes.`);
        }
      } catch (error: any) {
        if (error.message.includes("Cooldown period")) {
          setIsMinting(false);
          setAddingTokenToWallet("");
          setTxStatus(error.message);
          alert(error.message);
          return;
        }
        // If there's an error checking cooldown, we'll proceed and let the contract handle it
      }
      
      setTxStatus("Minting tokens...");
      
      // Call the public mint function directly
      const tx = await tokenContract.mint(connectedAccount, amount);
      setTxHash(tx.hash);
      setTxStatus("Transaction submitted. Waiting for confirmation...");
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTxStatus("Transaction confirmed! Tokens minted successfully.");
        
        // Update balance after successful transaction
        await updateTokenBalances();
        
        // Success message
        alert(`Successfully minted 100 ${token.symbol} to your wallet on Sepolia testnet!`);
      } else {
        setTxStatus("Transaction failed. Please try again.");
        alert(`Failed to mint ${token.symbol}. Please try again.`);
      }
      
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      setTxStatus(`Transaction failed: ${error.message}`);
      
      if (error.message.includes("execution reverted")) {
        alert(`Failed to mint ${token.symbol}: You may have reached the minting limit or cooldown period. Please try again later.`);
      } else if (error.message.includes("No contract deployed")) {
        alert(`No contract deployed at ${token.address}. The token contracts have been deployed to Sepolia testnet.`);
      } else {
        alert(`Error minting ${token.symbol}: ${error.message}`);
      }
    } finally {
      setIsMinting(false);
      setAddingTokenToWallet("");
    }
  };
  
  // Function to mint all test tokens at once
  const mintAllTestTokens = async () => {
    if (!connectedAccount || !signer) {
      alert("Please connect your wallet first!");
      return;
    }
    
    if (!networkReady) {
      const switched = await ensureCorrectNetwork();
      if (!switched) {
        alert("Please switch to Sepolia testnet to continue.");
        return;
      }
    }
    
    setIsMinting(true);
    setTxStatus("Adding tokens to MetaMask...");
    
    try {
      // First add all tokens to MetaMask
      for (const token of tokens) {
        if (!token.isNUSD) {
          await addTokenToMetaMask(token);
        }
      }
      
      setTxStatus("Minting tokens...");
      
      // Mint each token in sequence
      for (const token of tokens) {
        if (token.isNUSD) continue; // Skip NUSD as it's minted via the swap contract
        
        try {
          await mintTestToken(token);
          setTxStatus(`${token.symbol} minted successfully!`);
        } catch (error: any) {
          console.error(`Error minting ${token.symbol}:`, error);
          // Continue with next token even if one fails
          setTxStatus(`${token.symbol} minting failed, continuing with next token...`);
        }
      }
      
      // Update balances after all transactions
      await updateTokenBalances();
      
      // Success message
      alert("Successfully minted test tokens to your wallet!");
      
    } catch (error: any) {
      console.error("Error minting all tokens:", error);
      setTxStatus(`Process interrupted: ${error.message}`);
      alert(`Process interrupted: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };
  
  // Basic ABI for ERC20 tokens
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  
  // Extended ABI for tokens with mint function
  const ERC20_MINT_ABI = [
    ...ERC20_ABI,
    "function mint(address to, uint256 amount) returns (bool)",
    "function mintTo(address to, uint256 amount) returns (bool)",
    "function faucet(address to, uint256 amount) returns (bool)"
  ];
  
  // Basic ABI for NUSD token
  const NUSD_ABI = [
    ...ERC20_ABI,
    "function mint(address to, uint256 amount) returns (bool)",
    "function burn(uint256 amount) returns (bool)"
  ];
  
  // Basic ABI for SwapForNUSD contract
  const SWAP_FOR_NUSD_ABI = [
    "function swapToNUSD(address token, uint256 tokenAmount)",
    "function redeemFromNUSD(address token, uint256 nusdAmount)",
    "function calculateNUSDAmount(address token, uint256 tokenAmount) view returns (uint256)",
    "function calculateTokenAmount(address token, uint256 nusdAmount) view returns (uint256)",
    "function supportedCollaterals(address token) view returns (bool)",
    "function collateralPrices(address token) view returns (uint256)",
    "function collateralDecimals(address token) view returns (uint8)",
    "function deposits(address, address) view returns (uint256)",
    "function nusd() view returns (address)"
  ];

  // Test Faucet ABI for minting test tokens on Sepolia
  const TEST_FAUCET_ABI = [
    "function mintTestTokens(address token, address to, uint256 amount) returns (bool)",
    "function mintAllTestTokens(address to, uint256 amount) returns (bool)",
    "function getTokensForTesting() view returns (address[])"
  ];
  
  // Update the handleExecute function to better handle balance updates and MetaMask integration
  const handleExecute = async () => {
    if (!connectedAccount || !signer) {
      alert("Please connect your wallet first!");
      return;
    }
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    
    if (!swapContract || !nusdContract) {
      alert("Contracts not initialized. Please try again later.");
      return;
    }
    
    setIsLoading(true);
    setTxStatus("");
    setTxHash("");
    
    try {
      // Get token contract for the selected token
      const tokenSymbol = swapDirection === "mint" ? fromToken.symbol : toToken.symbol;
      const tokenContract = tokenContracts[tokenSymbol];
      
      if (!tokenContract) {
        alert(`${tokenSymbol} contract not found. Please try again.`);
        setIsLoading(false);
        return;
      }
      
      // Get token decimals
      const decimals = await tokenContract.decimals();
      
      // Parse amount with correct decimals
      const amount = swapDirection === "mint" ? 
                    parseUnits(fromAmount, decimals) :
                    parseEther(fromAmount); // NUSD uses 18 decimals
      
      if (swapDirection === "mint") {
        // MINTING: Depositing collateral to mint NUSD
        
        // Check if user has enough balance
        const balance = await tokenContract.balanceOf(connectedAccount);
        if (balance < amount) {
          alert(`Insufficient ${fromToken.symbol} balance. You have ${formatUnits(balance, decimals)} ${fromToken.symbol} but trying to use ${fromAmount} ${fromToken.symbol}.`);
          setIsLoading(false);
          return;
        }
        
        // First check allowance
        const swapAddress = await swapContract.getAddress();
        const allowance = await tokenContract.allowance(connectedAccount, swapAddress);
        
        // If allowance is not enough, approve first
        if (allowance < amount) {
          setTxStatus(`Approving ${fromAmount} ${fromToken.symbol} for swap...`);
          const approveTx = await tokenContract.approve(swapAddress, amount);
          setTxHash(approveTx.hash);
          
          // Wait for approval confirmation
          setTxStatus(`Waiting for approval confirmation... (Transaction may take 15-30 seconds)`);
          const approveReceipt = await approveTx.wait();
          if (approveReceipt.status !== 1) {
            alert("Token approval failed. Please try again.");
            setIsLoading(false);
            return;
          }
          
          setTxStatus(`Approval confirmed! Now minting NUSD with ${fromAmount} ${fromToken.symbol}...`);
        }
        
        // Record the pre-swap balances to show the user the change
        const preSwapFromBalance = await tokenContract.balanceOf(connectedAccount);
        const preSwapNusdBalance = await nusdContract.balanceOf(connectedAccount);
        
        // Now swap for NUSD
        const tokenAddress = await tokenContract.getAddress();
        setTxStatus(`Minting NUSD using ${fromAmount} ${fromToken.symbol}...`);
        const swapTx = await swapContract.swapToNUSD(tokenAddress, amount);
        setTxHash(swapTx.hash);
        
        // Wait for transaction to be mined
        setTxStatus(`Transaction submitted! Waiting for confirmation... (This may take 15-30 seconds)`);
        const swapReceipt = await swapTx.wait();
        
        if (swapReceipt.status === 1) {
          // Transaction succeeded, fetch new balances
          const postSwapFromBalance = await tokenContract.balanceOf(connectedAccount);
          const postSwapNusdBalance = await nusdContract.balanceOf(connectedAccount);
          
          // Calculate the difference
          const fromTokenDecrease = formatUnits(preSwapFromBalance - postSwapFromBalance, decimals);
          const nusdIncrease = formatUnits(postSwapNusdBalance - preSwapNusdBalance, 18); // NUSD uses 18 decimals
          
          setTxStatus(`NUSD minted successfully! 
            • Spent: ${fromTokenDecrease} ${fromToken.symbol}
            • Received: ${nusdIncrease} NUSD`);
          
          // Ensure NUSD is added to MetaMask
          const nusdToken = tokens.find(t => t.isNUSD);
          if (nusdToken) {
            try {
              await addTokenToMetaMask(nusdToken);
            } catch (error) {
              console.error("Error adding NUSD to MetaMask:", error);
              // Continue even if adding to MetaMask fails
            }
          }
          
          // Update balances to reflect the changes immediately
          await updateTokenBalances();
          
          const successMessage = `Successfully minted ${nusdIncrease} NUSD using ${fromTokenDecrease} ${fromToken.symbol}!`;
          console.log(successMessage);
          alert(successMessage);
        } else {
          setTxStatus("Transaction failed. Please try again.");
          alert("Failed to mint NUSD. Please try again.");
        }
      } else {
        // BURNING: Redeeming NUSD for collateral
        
        // Check if user has enough NUSD balance
        const nusdBalance = await nusdContract.balanceOf(connectedAccount);
        if (nusdBalance < amount) {
          alert(`Insufficient NUSD balance. You have ${formatEther(nusdBalance)} NUSD but trying to burn ${fromAmount} NUSD.`);
          setIsLoading(false);
          return;
        }
        
        // First check NUSD allowance
        const swapAddress = await swapContract.getAddress();
        const allowance = await nusdContract.allowance(connectedAccount, swapAddress);
        
        // If allowance is not enough, approve first
        if (allowance < amount) {
          setTxStatus(`Approving ${fromAmount} NUSD for redemption...`);
          const approveTx = await nusdContract.approve(swapAddress, amount);
          setTxHash(approveTx.hash);
          
          // Wait for approval confirmation
          setTxStatus(`Waiting for approval confirmation... (Transaction may take 15-30 seconds)`);
          const approveReceipt = await approveTx.wait();
          if (approveReceipt.status !== 1) {
            alert("NUSD approval failed. Please try again.");
            setIsLoading(false);
            return;
          }
          
          setTxStatus(`Approval confirmed! Now redeeming ${fromAmount} NUSD for ${toToken.symbol}...`);
        }
        
        // Record the pre-redemption balances
        const preRedeemNusdBalance = await nusdContract.balanceOf(connectedAccount);
        const preRedeemToBalance = await tokenContract.balanceOf(connectedAccount);
        
        // Now redeem NUSD for collateral
        const tokenAddress = await tokenContract.getAddress();
        setTxStatus(`Burning ${fromAmount} NUSD to redeem ${toToken.symbol}...`);
        const redeemTx = await swapContract.redeemFromNUSD(tokenAddress, amount);
        setTxHash(redeemTx.hash);
        
        // Wait for transaction to be mined
        setTxStatus(`Transaction submitted! Waiting for confirmation... (This may take 15-30 seconds)`);
        const redeemReceipt = await redeemTx.wait();
        
        if (redeemReceipt.status === 1) {
          // Transaction succeeded, fetch new balances
          const postRedeemNusdBalance = await nusdContract.balanceOf(connectedAccount);
          const postRedeemToBalance = await tokenContract.balanceOf(connectedAccount);
          
          // Calculate the difference
          const nusdDecrease = formatEther(preRedeemNusdBalance - postRedeemNusdBalance);
          const toTokenIncrease = formatUnits(postRedeemToBalance - preRedeemToBalance, decimals);
          
          setTxStatus(`NUSD redeemed successfully! 
            • Burned: ${nusdDecrease} NUSD
            • Received: ${toTokenIncrease} ${toToken.symbol}`);
          
          // Update balances to reflect the changes immediately
          await updateTokenBalances();
          
          const successMessage = `Successfully redeemed ${nusdDecrease} NUSD for ${toTokenIncrease} ${toToken.symbol}!`;
          console.log(successMessage);
          alert(successMessage);
        } else {
          setTxStatus("Transaction failed. Please try again.");
          alert("Failed to redeem NUSD. Please try again.");
        }
      }
      
      // Reset form
      setFromAmount("");
      setToAmount("");
      
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setTxStatus(`Transaction failed: ${error.message}`);
      alert(`Transaction failed: ${error.message || "Unknown error"}`);
    }
    
    setIsLoading(false);
  };
  
  // Update the updateTokenBalances function to get addresses from the token objects
  const updateTokenBalances = async () => {
    if (!connectedAccount || !signer || !networkReady) return;
    
    try {
      const updatedBalances = {...tokenBalances};
      let balancesChanged = false;
      
      // Update all token balances
      for (const token of tokens) {
        if (!token.address) {
          console.warn(`No address for ${token.symbol}, skipping balance update`);
          continue;
        }
        
        const tokenContract = tokenContracts[token.symbol];
        if (tokenContract) {
          try {
            console.log(`Updating balance for ${token.symbol} at ${token.address}`);
            const tokenBalance = await tokenContract.balanceOf(connectedAccount);
            const tokenDecimals = await tokenContract.decimals();
            const formattedBalance = parseFloat(formatUnits(tokenBalance, tokenDecimals));
            
            // Check if balance has changed
            if (updatedBalances[token.symbol] !== formattedBalance) {
              updatedBalances[token.symbol] = formattedBalance;
              balancesChanged = true;
              console.log(`Updated ${token.symbol} balance: ${formattedBalance}`);
            }
          } catch (error) {
            console.warn(`Error updating ${token.symbol} balance:`, error);
          }
        }
      }
      
      // Only update state if balances have changed
      if (balancesChanged) {
        // Update token balances state
        setTokenBalances(updatedBalances);
        
        // Update tokens with balances
        const updatedTokens = tokens.map(token => ({
          ...token,
          balance: updatedBalances[token.symbol] || 0
        }));
        
        setTokensWithBalances(updatedTokens);
        console.log("Token balances updated:", updatedBalances);
        
        // Force UI refresh
        setClientReady(false);
        setTimeout(() => setClientReady(true), 50);
      }
    } catch (error) {
      console.error("Error updating token balances:", error);
    }
  };

  // Update the token selection in component for safer type handling
  const onFromTokenSelect = (value: string) => {
    const selectedToken = tokens.find(t => t.id === parseInt(value));
    if (selectedToken) {
      handleTokenChange('from', selectedToken);
    }
  };
  
  const onToTokenSelect = (value: string) => {
    const selectedToken = tokens.find(t => t.id === parseInt(value));
    if (selectedToken) {
      handleTokenChange('to', selectedToken);
    }
  };

  // Improve the addTokenToMetaMask function to ensure it has the token address
  const addTokenToMetaMask = async (token: typeof tokens[number]) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    
    if (!token.address) {
      alert(`No contract address found for ${token.symbol}. Make sure deployment info is loaded.`);
      return;
    }
    
    setAddingTokenToWallet(token.symbol);
    
    try {
      console.log(`Adding ${token.symbol} to MetaMask with address ${token.address}`);
      
      // Request to add the token to MetaMask
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            // Use token logo or default image
            image: `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`,
          },
        },
      });
      
      console.log(`${token.symbol} was successfully added to MetaMask`);
    } catch (error: any) {
      console.error('Error adding token to MetaMask:', error);
      if (!error.message.includes('User rejected')) {
        alert(`Failed to add ${token.symbol} to your wallet: ${error.message}`);
      }
    }
    
    setAddingTokenToWallet("");
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Nova USD Swap</h1>
              <p className="text-muted-foreground">Mint and burn NUSD stablecoin on CoreDAO</p>
            </div>
            
            {/* Network indicator */}
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              {currentChainId && (
                <Badge variant={currentChainId === SEPOLIA_CHAIN_ID ? "default" : "destructive"} className="px-3 py-1">
                  {currentChainId === SEPOLIA_CHAIN_ID ? "CoreDAO Testnet" : "Wrong Network"}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Swap/Bridge Card */}
            <div className="lg:col-span-2">
              <Card className="glassmorphism overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Tabs defaultValue={mode} onValueChange={handleModeChange} className="w-full">
                        <TabsList className="bg-background/50 mb-0">
                          <TabsTrigger value="swap" className="flex items-center">
                            <ArrowDownUp className="h-4 w-4 mr-2" />
                            Mint/Burn NUSD
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    {/* Connect wallet button */}
                    {!connectedAccount ? (
                      <Button 
                        variant="default" 
                        onClick={connectWalletAndSetupNetwork}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Wallet className="h-4 w-4 mr-2" />
                        )}
                        Connect Wallet
                      </Button>
                    ) : (
                      <div className="text-sm bg-background/50 px-3 py-1 rounded-md border border-border/30">
                        {connectedAccount.substring(0, 6)}...{connectedAccount.substring(connectedAccount.length - 4)}
                      </div>
                    )}
                  </div>
                  
                  {/* Settings Panel */}
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 p-4 bg-background/50 rounded-lg border border-border/30"
                    >
                      <h3 className="text-sm font-medium mb-3">Transaction Settings</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="slippage">Slippage Tolerance</Label>
                            <span className="text-sm text-muted-foreground">{slippage}%</span>
                          </div>
                          <Slider 
                            id="slippage"
                            min={0.1} 
                            max={5} 
                            step={0.1} 
                            value={[slippage]} 
                            onValueChange={(value) => setSlippage(value[0])}
                            className="py-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="expert-mode">Expert Mode</Label>
                          <Switch id="expert-mode" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <Tabs value={mode} onValueChange={handleModeChange}>
                    <TabsContent value="swap" className="mt-0 space-y-4">
                      {/* From Token */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label>From</Label>
                          {/* <span className="text-muted-foreground">
                            Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
                          </span> */}
                        </div>
                        
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input 
                              type="text" 
                              value={fromAmount}
                              onChange={(e) => setFromAmount(e.target.value)}
                              className="pr-20 h-14 text-lg bg-background/50"
                            />
                            <Button 
                              variant="ghost" 
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs"
                              onClick={() => setFromAmount(fromToken.balance.toString())}
                            >
                              MAX
                            </Button>
                          </div>
                          
                          <Select 
                            value={fromToken.id.toString()} 
                            onValueChange={onFromTokenSelect}
                          >
                            <SelectTrigger className="w-[180px] h-14 bg-background/50">
                              <SelectValue>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                    {fromToken.logo.startsWith('http') ? (
                                      <Image 
                                        src={fromToken.logo} 
                                        alt={fromToken.symbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <span className="text-lg">{fromToken.logo}</span>
                                    )}
                                  </div>
                                  <span>{fromToken.symbol}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tokens.map((token) => (
                                <SelectItem key={token.id} value={token.id.toString()}>
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                      {token.logo.startsWith('http') ? (
                                        <Image 
                                          src={token.logo} 
                                          alt={token.symbol}
                                          width={20}
                                          height={20}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <span>{token.logo}</span>
                                      )}
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
                        </div>
                      </div>
                      
                      {/* Swap Button */}
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full bg-background/80 hover:bg-background p-2 transform rotate-90"
                          onClick={handleSwapTokens}
                        >
                          <ArrowDownUp className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* To Token */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label>To (Estimated)</Label>
                          {/* <span className="text-muted-foreground">
                            Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
                          </span> */}
                        </div>
                        
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input 
                              type="text" 
                              value={toAmount}
                              readOnly
                              className="pr-12 h-14 text-lg bg-background/50"
                            />
                            {isLoading && (
                              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              </div>
                            )}
                          </div>
                          
                          <Select 
                            value={toToken.id.toString()} 
                            onValueChange={onToTokenSelect}
                          >
                            <SelectTrigger className="w-[180px] h-14 bg-background/50">
                              <SelectValue>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                    {toToken.logo.startsWith('http') ? (
                                      <Image 
                                        src={toToken.logo} 
                                        alt={toToken.symbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <span className="text-lg">{toToken.logo}</span>
                                    )}
                                  </div>
                                  <span>{toToken.symbol}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tokens.map((token) => (
                                <SelectItem key={token.id} value={token.id.toString()}>
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                      {token.logo.startsWith('http') ? (
                                        <Image 
                                          src={token.logo} 
                                          alt={token.symbol}
                                          width={20}
                                          height={20}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <span>{token.logo}</span>
                                      )}
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
                        </div>
                      </div>
                      
                      {/* Swap Details */}
                      <div className="p-4 bg-background/50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate</span>
                          <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Slippage Tolerance</span>
                          <span>{slippage}%</span>
                        </div>
                        
                        {/* <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Gas Fee</span>
                          <span>${gasFee}</span>
                        </div> */}
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimum Received</span>
                          <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}</span>
                        </div>
                      </div>
                      
                      {/* Swap Button */}
                      <Button 
                        className="w-full h-14 text-lg bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white"
                        onClick={handleExecute}
                        disabled={isLoading || !fromAmount || parseFloat(fromAmount) <= 0 || !connectedAccount}
                      >
                        {isLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <Zap className="h-5 w-5 mr-2" />
                        )}
                        {swapDirection === 'mint' ? 'Mint NUSD' : 'Burn NUSD'}
                      </Button>
                    </TabsContent>
                  </Tabs>
                  
                  {/* Transaction Status */}
                  {txStatus && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <h3 className="text-sm font-medium flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Transaction Status
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{txStatus}</p>
                      {txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 flex items-center mt-1 hover:underline"
                        >
                          {/* <ExternalLink className="h-3 w-3 mr-1" /> */}
                     
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div>
              {/* Transaction History */}
              <Card className="glassmorphism mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientReady && transactionHistory.map((tx, index) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className={tx.type === "swap" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}>
                            {tx.type === "swap" ? (
                              <ArrowDownUp className="h-3 w-3 mr-1" />
                            ) : (
                              <Globe className="h-3 w-3 mr-1" />
                            )}
                            {tx.type === "swap" ? "Swap" : "Bridge"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{tx.time}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">{tx.amount} {tx.from}</span>
                            <ArrowRight className="h-3 w-3 mx-1" />
                            <span className="font-medium">{tx.amount} {tx.to}</span>
                          </div>
                        </div>
                        
                        {tx.type === "bridge" && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {tx.fromChain} → {tx.toChain}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Value: ${tx.value}</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                    {!clientReady && (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading transaction history...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Market Info */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardDescription>Get test tokens for Nova USD platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        You're now using CoreDAO testnet. Follow these steps to test the Nova USD platform:
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-2">
                        <li>Get CoreDAO testnet tokens from a faucet (button below)</li>
                        <li>Mint test tokens (USDC, USDT, coreBTC) to your wallet</li>
                        <li>Use these test tokens as collateral to mint NUSD in the Swap interface</li>
                        <li>Later, you can burn NUSD to redeem your original collateral</li>
                      </ol>
                      
                      <div className="flex flex-col gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center justify-center"
                          onClick={openSepoliaFaucet}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Get CoreDAO Testnet Tokens
                        </Button>
                        
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full flex items-center justify-center"
                          onClick={mintAllTestTokens}
                          disabled={isMinting || !networkReady || !connectedAccount}
                        >
                          {isMinting ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Zap className="h-4 w-4 mr-1" />
                          )}
                          Mint All Test Tokens
                        </Button>
                      </div>
                    </div>
                    
                    {/* Update the warning box */}
                    <div className="p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                      <h3 className="font-medium text-yellow-400 flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Nova USD on CoreDAO
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Nova USD is a decentralized stablecoin protocol on CoreDAO:
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                        <li>NUSD is backed by liquid staking derivatives and perpetual futures</li>
                        <li>Mint NUSD using USDC, USDT, or coreBTC as collateral</li>
                        <li>NUSD can be bridged across multiple chains including CoreDAO, Ethereum, and Arbitrum</li>
                        <li>All balances are fetched from the blockchain in real-time</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        This is a testnet implementation of Nova USD on CoreDAO chain.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}