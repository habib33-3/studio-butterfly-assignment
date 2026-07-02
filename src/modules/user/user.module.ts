import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { env } from "src/common/env/env.config";

import { JwtStrategy } from "./strategy/jwt.strategy";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: () => ({
                secret: env.JWT_SECRET,
                signOptions: {
                    expiresIn: env.ACCESS_TOKEN_EXPIRES,
                },
            }),
        }),
    ],
    controllers: [UserController],
    providers: [UserService, JwtStrategy],
    exports: [JwtModule],
})
export class UserModule {}
