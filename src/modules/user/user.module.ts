import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { JwtStrategy } from "./strategy/jwt.strategy";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: "1h",
                },
            }),
        }),
    ],
    controllers: [UserController],
    providers: [UserService, JwtStrategy],
    exports: [JwtModule],
})
export class UserModule {}
