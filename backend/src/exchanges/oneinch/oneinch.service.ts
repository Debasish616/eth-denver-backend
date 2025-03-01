import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { ethers, MaxUint256, TransactionReceipt, ZeroAddress } from 'ethers';
import { ProviderService } from '../../blockchain/providers/provider.service';

@Injectable()
export class OneInchService {
  private readonly logger = new Logger(OneInchService.name);
  private readonly baseUrl = 'https://api.1inch.dev/swap/v6.0';
  private readonly apiKey: string;
  private readonly chainIds: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
  ) {
    this.apiKey = this.configService.get<string>('oneInch.apiKey')!;

    // Map network names to 1inch chain IDs
    this.chainIds.set('ethereum', 1);
    this.chainIds.set('polygon', 137);
    this.chainIds.set('arbitrum', 42161);
    this.chainIds.set('optimism', 10);
  }

  async getQuote(
    network: string,
    fromToken: string,
    toToken: string,
    amount: string,
  ): Promise<any> {
    try {
      const chainId = this.chainIds.get(network);
      if (!chainId) {
        throw new Error(`Chain ID for network ${network} not found`);
      }

      const response = await axios.get(`${this.baseUrl}/${chainId}/quote`, {
        params: {
          src: fromToken,
          dst: toToken,
          amount,
        },
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get quote from 1inch: ${(error as AxiosError)?.message}`,
      );
      throw error;
    }
  }

  async getTokenPriceOnChainInUSD(
    network: string,
    tokenAddresses: string[],
  ): Promise<{
    [key: string]: number;
  }> {
    try {
      const chainId = this.chainIds.get(network);
      if (!chainId) {
        throw new Error(`Chain ID for network ${network} not found`);
      }

      const response = await axios.post(
        `https://api.1inch.dev/price/v1.1/${chainId}`,
        {
          tokens: tokenAddresses,
          currency: 'USD',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const data = response.data as {
        [x: string]: string;
      };

      const dataParsed = {} as { [key: string]: number };

      for (const [address, price] of Object.entries(data)) {
        dataParsed[address] = parseFloat(price);
      }

      return dataParsed;
    } catch (error) {
      this.logger.error(
        `Failed to get quote from 1inch: ${(error as AxiosError)?.message}`,
      );
      throw error;
    }
  }

  async buildSwapTransaction(
    network: string,
    fromToken: string,
    toToken: string,
    amount: string,
    fromAddress: string,
    slippage: string,
  ): Promise<any> {
    try {
      const chainId = this.chainIds.get(network);
      if (!chainId) {
        throw new Error(`Chain ID for network ${network} not found`);
      }

      const response = await axios.get(`${this.baseUrl}/${chainId}/swap`, {
        params: {
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          amount,
          fromAddress,
          slippage,
        },
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to build swap transaction: ${(error as AxiosError)?.message}`,
      );
      throw error;
    }
  }

  async executeSwap(
    network: string,
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: string,
  ): Promise<TransactionReceipt> {
    try {
      const wallet = this.providerService.getWallet(network);
      const fromAddress = wallet.address;

      // Approve token spending if needed (for non-ETH tokens)
      if (fromToken !== ZeroAddress) {
        await this.approveTokens(network, fromToken, amount);
      }

      // Build the swap transaction
      const swapData = await this.buildSwapTransaction(
        network,
        fromToken,
        toToken,
        amount,
        fromAddress,
        slippage,
      );

      // Execute the transaction
      const tx = await wallet.sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: swapData.tx.value,
        gasPrice: swapData.tx.gasPrice,
        gasLimit: Math.floor(Number(swapData.tx.gas) * 1.2), // Add 20% buffer for gas
      });

      this.logger.log(`Swap transaction sent: ${tx.hash}`);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      this.logger.log(`Swap transaction confirmed: ${receipt?.hash}`);

      if (!receipt) {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error) {
      this.logger.error(`Failed to execute swap: ${error?.message}`);
      throw error;
    }
  }

  private async approveTokens(
    network: string,
    tokenAddress: string,
    amount: string,
  ): Promise<void> {
    try {
      const chainId = this.chainIds.get(network);
      const wallet = this.providerService.getWallet(network);

      // Get token allowance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)',
        ],
        wallet,
      );

      // Get 1inch router address
      const response = await axios.get(
        `${this.baseUrl}/${chainId}/approve/spender`,
      );
      const spenderAddress = response.data.address;

      // Check if allowance is sufficient
      const allowance = await tokenContract.allowance(
        wallet.address,
        spenderAddress,
      );

      if (allowance.lt(amount)) {
        // Approve max amount
        const tx = await tokenContract.approve(spenderAddress, MaxUint256);
        await tx.wait();
        this.logger.log(`Approved 1inch router for token ${tokenAddress}`);
      }
    } catch (error) {
      this.logger.error(`Failed to approve tokens: ${error.message}`);
      throw error;
    }
  }
}
