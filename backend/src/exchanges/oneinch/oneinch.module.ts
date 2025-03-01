import { Module } from '@nestjs/common';
import { OneInchService } from './oneinch.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [OneInchService],
  exports: [OneInchService],
})
export class OneInchModule {}
