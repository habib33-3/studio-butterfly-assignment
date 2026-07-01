import {
    BeforeApplicationShutdown,
    Injectable,
    OnModuleInit,
} from "@nestjs/common";

import { PrismaClient } from "../../../generated/prisma/client";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, BeforeApplicationShutdown
{
    async onModuleInit(): Promise<void> {
        console.info("Connecting to database...");
        await this.connectWithRetry();
        console.info("Database connected");
    }

    async beforeApplicationShutdown(signal?: string): Promise<void> {
        if (signal) {
            console.warn(`Database disconnecting (${signal})`);
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
            console.info(`DB connection attempt ${attempt}`);

            try {
                await this.$connect();
                return;
            } catch (error: unknown) {
                if (attempt >= retries) {
                    const message =
                        error instanceof Error ? error.message : String(error);

                    console.error(
                        `Failed to connect to DB after ${attempt} attempts: ${message}`
                    );

                    throw new Error("Failed to connect to the database", {
                        cause: error,
                    });
                }

                const backoff = delayMs * attempt;

                console.warn(`DB connection failed, retrying in ${backoff}ms`);

                await new Promise<void>((resolve) => {
                    setTimeout(resolve, backoff);
                });
            }
        }
    }
}
