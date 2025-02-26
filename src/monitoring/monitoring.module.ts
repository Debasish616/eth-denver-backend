import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PriceMonitorService } from './price-monitor.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [EventEmitterModule.forRoot(), BlockchainModule, ExchangesModule],
  providers: [PriceMonitorService],
  exports: [PriceMonitorService],
})
export class MonitoringModule {}
