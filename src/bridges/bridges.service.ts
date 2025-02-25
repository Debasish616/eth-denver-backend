import { Injectable } from '@nestjs/common';
import { WormholeService } from './wormhole/wormhole.service';

@Injectable()
export class BridgesService {
  constructor(private wormholeService: WormholeService) {}

  // Facade methods for unified access to different bridges
  async bridgeTokens(
    sourceNetwork: string,
    targetNetwork: string,
    tokenAddress: string,
    amount: string,
  ): Promise<any> {
    // Currently we're only using Wormhole, but could add more bridges in the future
    return this.wormholeService.bridgeTokens(
      sourceNetwork,
      targetNetwork,
      tokenAddress,
      amount,
    );
  }
}
