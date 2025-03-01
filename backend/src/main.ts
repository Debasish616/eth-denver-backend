import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Arbitrage Service')
    .setDescription('The Arbitrage Service API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Arbitrage bot running on port ${port}`);
}
void bootstrap();
