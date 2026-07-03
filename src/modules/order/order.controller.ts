import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { CurrentUser } from "src/common/decorator/current-user.decorator";

import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderService } from "./order.service";

@Controller("order")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @ApiOperation({
        summary: "Create a new order",
        description:
            "Creates a new order for a product with the specified quantity and address.",
    })
    async createOrder(
        @Body() payload: CreateOrderDto,
        @CurrentUser("sub") userId: string
    ) {
        return this.orderService.createOrder(userId, payload);
    }
}
