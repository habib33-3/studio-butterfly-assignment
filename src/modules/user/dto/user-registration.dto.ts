import { ApiProperty } from "@nestjs/swagger";

import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

export class UserRegistrationDto {
    @ApiProperty({
        example: "User",
        description: "Full name of the user",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: "user@e.com",
        description: "Unique email address",
    })
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: "12345678!",
        description: "Password must be at least 8 characters ",
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;
}
