import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { ElizaModule } from './eliza/eliza.module';

@Module({
  imports: [ElizaModule],
  providers: [BotsService],
  exports: [BotsService, ElizaModule],
})
export class BotsModule {}
