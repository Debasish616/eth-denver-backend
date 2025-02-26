import { Module } from '@nestjs/common';
import { ElizaService } from './eliza.service';

@Module({
  providers: [ElizaService],
  exports: [ElizaService],
})
export class ElizaModule {}
