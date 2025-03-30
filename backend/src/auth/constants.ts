import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

// Charger les variables d'environnement
dotenv.config();

const logger = new Logger('JwtConstants');

// Vérifier que la clé secrète est définie
if (!process.env.JWT_SECRET) {
  logger.error("JWT_SECRET n'est pas défini dans les variables d'environnement");
  throw new Error("JWT_SECRET doit être défini dans les variables d'environnement");
}

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};
