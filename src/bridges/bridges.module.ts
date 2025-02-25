import { Module } from '@nestjs/common';
import { BridgesService } from './bridges.service';
import { WormholeModule } from './wormhole/wormhole.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule, WormholeModule],
  providers: [BridgesService],
  exports: [BridgesService, WormholeModule],
})
export class BridgesModule {}
