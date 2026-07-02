import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { UserLoginDto } from "./dto/user-login";
import { UserRegistrationDto } from "./dto/user-registration.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("register")
    @ApiOperation({
        summary: "Register a new user",
        description: "Creates a new user account with the provided details.",
    })
    async register(@Body() payload: UserRegistrationDto) {
        return this.userService.registration(payload);
    }

    @Post("login")
    @ApiOperation({
        summary: "User login",
        description: "Authenticates a user with email and password.",
    })
    async login(@Body() payload: UserLoginDto) {
        return this.userService.login(payload);
    }
}
