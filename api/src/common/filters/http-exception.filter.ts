import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        details = (res as any).error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Handle Firebase specific error codes gracefully
      const anyErr = exception as any;
      if (anyErr.code) {
        details = {
          code: anyErr.code,
          errorInfo: anyErr.errorInfo || null,
        };
      }
    }

    this.logger.error(`[${status}] ${message}`, exception instanceof Error ? exception.stack : '');

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
