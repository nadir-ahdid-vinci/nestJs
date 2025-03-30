import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { getLoggerConfig } from '../config/logger.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    this.logger = winston.createLogger(getLoggerConfig(configService));
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const contextInfo = context || this.context || 'Application';

    return {
      timestamp,
      context: contextInfo,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
    };
  }

  error(message: any, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    if (trace) {
      formattedMessage['trace'] = trace;
    }
    this.logger.error(formattedMessage);
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
  }

  info(message: any, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
  }

  // Méthode pour les logs de sécurité
  security(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context || 'Security');
    formattedMessage['type'] = 'SECURITY';
    this.logger.warn(formattedMessage);
  }

  // Méthode pour les logs d'audit
  audit(action: string, userId: string, details: any, context?: string) {
    const auditLog = {
      action,
      userId,
      details,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
    };
    this.logger.info(this.formatMessage(auditLog, context || 'Audit'));
  }
}
