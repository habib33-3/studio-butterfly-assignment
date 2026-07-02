import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./common/env/env.config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { UserModule } from "./modules/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        PrismaModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
