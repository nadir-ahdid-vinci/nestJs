// main.ts (point d'entrée de l'application NestJS)
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as csurf from 'csurf';
import { Logger } from '@nestjs/common';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurisation de l'application
  app.use(helmet()); // Protection contre les attaques web courantes
  app.enableCors({
    origin: "http://localhost:3000", // Remplace "*" par ton frontend
    credentials: true, // Permet d'envoyer les cookies/session
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.useGlobalInterceptors(new ErrorsInterceptor());
  
  // Logger
  const logger = new Logger('Bootstrap');
  logger.log('Application démarrée sur le port 3000');

  await app.listen(8000);
}
bootstrap();