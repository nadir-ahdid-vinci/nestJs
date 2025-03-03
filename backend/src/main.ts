// main.ts (point d'entrée de l'application NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as csurf from 'csurf';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurisation de l'application
  app.use(helmet()); // Protection contre les attaques web courantes
  app.enableCors(); // Activation du CORS pour éviter les restrictions cross-origin
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  // Logger
  const logger = new Logger('Bootstrap');
  logger.log('Application démarrée sur le port 3000');

  await app.listen(8000);
}
bootstrap();