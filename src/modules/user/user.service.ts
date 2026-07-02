import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import * as argon2 from "argon2";
import { PrismaService } from "src/common/prisma/prisma.service";
import { JwtPayload } from "src/type/types";

import { UserLoginDto } from "./dto/user-login";
import { UserRegistrationDto } from "./dto/user-registration.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    private async generateJwtToken(payload: JwtPayload) {
        return this.jwtService.signAsync(payload);
    }

    async registration(payload: UserRegistrationDto) {
        const existUser = await this.prisma.user.findUnique({
            where: {
                email: payload.email,
            },
            select: {
                id: true,
            },
        });

        if (existUser) {
            throw new BadRequestException("User already exist");
        }

        const hashedPassword = await argon2.hash(payload.password);

        const user = await this.prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: hashedPassword,
            },
            omit: {
                password: true,
            },
        });

        const accessToken = await this.generateJwtToken({
            sub: user.id,
            email: user.email,
        });

        return {
            user,
            accessToken,
        };
    }

    async login(payload: UserLoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: payload.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await argon2.verify(
            user.password,
            payload.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const { password, ...userWithoutPassword } = user;

        const accessToken = await this.generateJwtToken({
            sub: user.id,
            email: user.email,
        });

        return {
            user: userWithoutPassword,
            accessToken,
        };
    }

    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }
}
