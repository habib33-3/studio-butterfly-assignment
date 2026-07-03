import { ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: "Mechanical Keyboard",
        description: "Product name",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: "Electronics",
        description: "Product category",
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional({
        example: 99.99,
        description: "Product price",
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price?: number;

    @ApiPropertyOptional({
        example: 50,
        description: "Available stock quantity",
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    quantity?: number;
}
