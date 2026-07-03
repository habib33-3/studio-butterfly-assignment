import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CancelOrderDto {
    @ApiProperty({
        description: "Reason for cancelling the order",
        example: "Customer requested cancellation before shipment.",
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    cancelReason: string;
}
