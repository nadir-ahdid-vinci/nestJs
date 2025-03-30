import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse();

    // Log l'erreur avec des détails
    this.logger.error(`
            Path: ${request.url}
            Method: ${request.method}
            Status: ${status}
            Message: ${typeof error === 'string' ? error : error['message']}
            Body: ${JSON.stringify(request.body)}
            User: ${request.user ? JSON.stringify(request.user) : 'Non authentifié'}
        `);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof error === 'string' ? error : error['message'],
      error: exception.name,
    });
  }
}
