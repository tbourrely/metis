import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = exception.getResponse();

    // Log full error with stack when available
    const message = `${req?.method ?? 'UNKNOWN'} ${req?.url ?? 'UNKNOWN'} ${status} - ${JSON.stringify(responseBody)}`;

    this.log(status, message, exception.stack);

    // Send standard JSON error response
    try {
      res.status(status).json({ statusCode: status, message: responseBody });
    } catch (err) {
      // In case response is not available
      this.logger.error('Failed to send error response', (err as Error).stack);
    }
  }

  log(status: number, message: string, trace?: string) {
    if (status >= 500) {
      this.logger.error(message, trace);
    } else if (status >= 400) {
      this.logger.warn(message);
    } else {
      this.logger.log(message);
    }
  }
}
