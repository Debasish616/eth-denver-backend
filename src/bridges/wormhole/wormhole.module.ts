import { Module } from '@nestjs/common';
import { WormholeService } from './wormhole.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [WormholeService],
  exports: [WormholeService],
})
export class WormholeModule {}
