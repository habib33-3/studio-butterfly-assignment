import {
    BeforeApplicationShutdown,
    Injectable,
    Logger,
    OnModuleInit,
} from "@nestjs/common";

import { PrismaClient } from "generated/prisma/client";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, BeforeApplicationShutdown
{
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit(): Promise<void> {
        this.logger.log("Connecting to database...");
        await this.connectWithRetry();
        this.logger.log("Database connected");
    }

    async beforeApplicationShutdown(signal?: string): Promise<void> {
        if (signal) {
            this.logger.warn(`Database disconnecting (${signal})`);
        }

        await this.$disconnect();
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    private async connectWithRetry(retries = 5, delayMs = 1000): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            this.logger.log(`DB connection attempt ${attempt}`);

            try {
                await this.$connect();
                return;
            } catch (error: unknown) {
                if (attempt >= retries) {
                    const message =
                        error instanceof Error ? error.message : String(error);

                    this.logger.error(
                        `Failed to connect to DB after ${attempt} attempts: ${message}`
                    );

                    throw new Error("Failed to connect to the database", {
                        cause: error,
                    });
                }

                const backoff = delayMs * attempt;

                this.logger.warn(
                    `DB connection failed, retrying in ${backoff}ms`
                );

                await new Promise<void>((resolve) => {
                    setTimeout(resolve, backoff);
                });
            }
        }
    }
}
