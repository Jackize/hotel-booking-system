import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // strip unknown fields
    forbidNonWhitelisted: true,   // 400 on unknown fields
    transform: true,              // transform payloads to DTO classes
    transformOptions: { enableImplicitConversion: false },
  }));

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
