import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // Log différent selon le type d'erreur
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - Error: ${message}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - Error: ${message}`,
      );
    }

    // Log des détails de la requête
    this.logger.debug(`Request body: ${JSON.stringify(request.body)}`);
    this.logger.debug(`Request query: ${JSON.stringify(request.query)}`);
    this.logger.debug(`Request params: ${JSON.stringify(request.params)}`);

    response.status(status).json(errorResponse);
  }
} 