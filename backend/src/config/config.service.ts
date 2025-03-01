import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T = any>(key: string): T {
    const value = this.configService.get<T>(key);

    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is missing`);
    }

    return value;
  }
}
