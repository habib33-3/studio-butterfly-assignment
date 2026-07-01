// common/filters/global-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";

import { Request, Response } from "express";

import { Prisma } from "generated/prisma/client";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";

        if (exception instanceof HttpException) {
            status = exception.getStatus();

            const error = exception.getResponse();

            message =
                error instanceof Object && "message" in error
                    ? (error as Error).message
                    : String(error);
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case "P2002":
                    status = HttpStatus.CONFLICT;
                    message = "Resource already exists";
                    break;

                case "P2025":
                    status = HttpStatus.NOT_FOUND;
                    message = "Resource not found";
                    break;

                default:
                    message = "Database error";
            }
        }

        if (status >= 500) {
            this.logger.error(exception);
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
