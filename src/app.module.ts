import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { BridgesModule } from './bridges/bridges.module';
import { BotsModule } from './bots/bots.module';
import { ArbitrageModule } from './arbitrage/arbitrage.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BlockchainModule,
    ExchangesModule,
    BridgesModule,
    BotsModule,
    ArbitrageModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
