import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export const getLoggerConfig = (configService: ConfigService) => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Masquer les informations sensibles
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'secret', 'key'];
  const maskSensitiveData = (info: any): any => {
    if (typeof info.message === 'object') {
      const maskedObj = { ...info.message };
      sensitiveFields.forEach(field => {
        if (field in maskedObj) {
          maskedObj[field] = '***MASKED***';
        }
      });
      info.message = maskedObj;
    }
    return info;
  };

  // Configuration des transports
  const transports: winston.transport[] = [
    // Un seul fichier pour tous les logs
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ];

  // En développement, on ajoute les logs console
  if (!isProduction) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike(),
        ),
      }),
    );
  }

  return {
    levels: logLevels,
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format(maskSensitiveData)(),
    ),
    transports,
    // Gestion des exceptions et rejets non gérés dans le même fichier
    exceptionHandlers: [
      new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '14d',
      }),
    ],
    rejectionHandlers: [
      new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '14d',
      }),
    ],
  };
};
