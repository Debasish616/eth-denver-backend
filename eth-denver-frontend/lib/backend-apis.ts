// src/services/arbitrageService.ts
import axios from "axios";

export interface TokenConfig {
  symbol: string;
  address: Record<string, string>;
  decimals: number;
}

export interface ArbitrageOpportunity {
  sourceNetwork: string;
  targetNetwork: string;
  token: TokenConfig;
  sourcePriceUSD: number;
  targetPriceUSD: number;
  priceDifferencePercent: number;
  estimatedProfit: number;
  estimatedGasCost: number;
  estimatedBridgeCost: number;
  netProfitUSD: number;
  netProfitPercent: number;
  tradeSize: string;
}

const BACKEND_URL_BASE =
  process.env.BACKEND_URL_BASE ?? "http://localhost:3000";

const axiosBase = axios.create({
  baseURL: BACKEND_URL_BASE,
  headers: {
    Accept: "*/*",
  },
});

export const fetchArbitrageOpportunities = async (): Promise<
  ArbitrageOpportunity[]
> => {
  try {
    const response = await axiosBase.get<ArbitrageOpportunity[]>(
      "/opportunities/opportunities",
      {
        headers: {
          Accept: "*/*",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching arbitrage opportunities:", error);
    throw error;
  }
};
