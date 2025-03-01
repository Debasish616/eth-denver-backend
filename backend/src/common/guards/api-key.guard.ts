import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // // Get the configured API key
    // const expectedApiKey = this.configService.get<string>('API_KEY');

    // // If API key is not set in config, deny all requests
    // if (!expectedApiKey) {
    //   throw new UnauthorizedException(
    //     'API key authentication is not configured',
    //   );
    // }

    // // Check if the provided API key matches
    // if (!apiKey || apiKey !== expectedApiKey) {
    //   throw new UnauthorizedException('Invalid API key');
    // }

    return true;
  }
}
