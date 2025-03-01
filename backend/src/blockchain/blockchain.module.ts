import { Module } from '@nestjs/common';
import { ProviderModule } from './providers/provider.module';

@Module({
  imports: [ProviderModule],
  exports: [ProviderModule],
})
export class BlockchainModule {}
