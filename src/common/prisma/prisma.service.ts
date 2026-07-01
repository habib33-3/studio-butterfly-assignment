import {
    BeforeApplicationShutdown,
    Injectable,
    Logger,
    OnModuleInit,
} from "@nestjs/common";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "src/generated/prisma/client";

import { env } from "../env/env.config";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, BeforeApplicationShutdown
{
    constructor() {
        super({
            adapter: new PrismaMariaDb(env.DATABASE_URL),
        });
    }

    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit(): Promise<void> {
        this.logger.log("Connecting to database...");
        await this.$connect();
        this.logger.log("Database connected");
    }

    async beforeApplicationShutdown(): Promise<void> {
        this.logger.log("Disconnecting from database...");
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
}
