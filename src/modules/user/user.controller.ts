import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { CurrentUser } from "src/common/decorator/current-user.decorator";
import { Public } from "src/common/decorator/public.decorator";

import { UserLoginDto } from "./dto/user-login";
import { UserRegistrationDto } from "./dto/user-registration.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post("register")
    @ApiOperation({
        summary: "Register a new user",
        description: "Creates a new user account with the provided details.",
    })
    async register(@Body() payload: UserRegistrationDto) {
        return this.userService.registration(payload);
    }

    @Public()
    @Post("login")
    @ApiOperation({
        summary: "User login",
        description: "Authenticates a user with email and password.",
    })
    async login(@Body() payload: UserLoginDto) {
        return this.userService.login(payload);
    }

    @Get("me")
    @ApiOperation({
        summary: "Get current user",
        description:
            "Retrieves the details of the currently authenticated user.",
    })
    async getCurrentUser(@CurrentUser("sub") userId: string) {
        return this.userService.getCurrentUser(userId);
    }
}
