import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateOrderDto {
    @ApiProperty({
        example: "b3f8d4d8-6a8c-4d6f-9d2c-4b7f5c1d9e72",
        description: "Unique identifier of the product to order",
    })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        example: 2,
        description: "Quantity of the product to purchase",
        minimum: 1,
        maximum: 100,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    quantity: number;

    @ApiProperty({
        example:
            "18374 Gibson Extensions Suite 778 , Port Efren, Delaware 72557-0639 United States",
        description: "Shipping address for the order",
    })
    @IsString()
    @IsNotEmpty()
    address: string;
}
