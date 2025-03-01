import { Injectable } from '@nestjs/common';
import { OneInchService } from './oneinch/oneinch.service';

@Injectable()
export class ExchangesService {
  constructor(private oneInchService: OneInchService) {}

  // Facade methods for unified access to different DEXes
  async getQuote(
    network: string,
    fromToken: string,
    toToken: string,
    amount: string,
  ): Promise<any> {
    // Currently we're only using 1inch, but in the future we could add more DEXes
    return this.oneInchService.getQuote(network, fromToken, toToken, amount);
  }

  async executeSwap(
    network: string,
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: string,
  ): Promise<any> {
    return this.oneInchService.executeSwap(
      network,
      fromToken,
      toToken,
      amount,
      slippage,
    );
  }
}
