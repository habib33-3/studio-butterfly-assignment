import { ApiProperty } from "@nestjs/swagger";

import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        example: "Wireless Mouse",
        description: "Product name",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: 29.99,
        description: "Product price",
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;

    @ApiProperty({
        example: "Electronics",
        description: "Product category",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    category: string;

    @ApiProperty({
        example: 100,
        description: "Available stock quantity",
        minimum: 0,
    })
    @IsInt()
    @Min(0)
    quantity: number;
}
