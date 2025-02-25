import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { OneInchModule } from './oneinch/oneinch.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule, OneInchModule],
  providers: [ExchangesService],
  exports: [ExchangesService, OneInchModule],
})
export class ExchangesModule {}
