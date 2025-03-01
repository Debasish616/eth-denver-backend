import { Injectable } from '@nestjs/common';
import { ElizaService } from './eliza/eliza.service';

@Injectable()
export class BotsService {
  constructor(private elizaService: ElizaService) {}

  // Facade methods for unified access to different bot frameworks
  async createBot(name: string, description: string): Promise<any> {
    return this.elizaService.createBot(name, description);
  }

  async executeAction(botId: string, action: any): Promise<void> {
    return this.elizaService.executeAction(botId, action);
  }
}
