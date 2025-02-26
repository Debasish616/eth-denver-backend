import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ElizaBot {
  id: string;
  name: string;
  status: string;
}

interface ElizaAction {
  type: string;
  network: string;
  data: any;
}

@Injectable()
export class ElizaService {
  private readonly logger = new Logger(ElizaService.name);
  private readonly baseUrl = 'https://api.eliza.bot'; // Placeholder API URL
  private readonly apiKey: string;
  private activeBot: ElizaBot | null = null;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('elizaOS.apiKey') || '';
  }

  async createBot(name: string, description: string): Promise<ElizaBot> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/bots`,
        {
          name,
          description,
          type: 'arbitrage',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      this.activeBot = response.data;
      this.logger.log(`Created ElizaOS bot: ${name} (${response.data.id})`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create ElizaOS bot: ${error.message}`);
      throw error;
    }
  }

  async defineStrategy(
    botId: string,
    tokenPairs: Array<{
      sourceChain: string;
      targetChain: string;
      token: string;
    }>,
    minProfitThreshold: string,
    maxTradeSize: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/bots/${botId}/strategy`,
        {
          tokenPairs,
          minProfitThreshold,
          maxTradeSize,
          maxSlippage: this.configService.get<string>('trading.maxSlippage'),
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Defined strategy for bot ${botId}`);
    } catch (error) {
      this.logger.error(`Failed to define bot strategy: ${error.message}`);
      throw error;
    }
  }

  async startBot(botId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/bots/${botId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Started bot ${botId}`);
    } catch (error) {
      this.logger.error(`Failed to start bot: ${error.message}`);
      throw error;
    }
  }

  async stopBot(botId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/bots/${botId}/stop`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Stopped bot ${botId}`);
    } catch (error) {
      this.logger.error(`Failed to stop bot: ${error.message}`);
      throw error;
    }
  }

  async executeAction(botId: string, action: ElizaAction): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/bots/${botId}/execute`,
        {
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Executed action on bot ${botId}: ${action.type}`);
    } catch (error) {
      this.logger.error(`Failed to execute bot action: ${error.message}`);
      throw error;
    }
  }

  async getBotStatus(botId: string): Promise<ElizaBot> {
    try {
      const response = await axios.get(`${this.baseUrl}/bots/${botId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get bot status: ${error.message}`);
      throw error;
    }
  }
}
