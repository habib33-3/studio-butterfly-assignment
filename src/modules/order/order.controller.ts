import {
    Body,
    Controller,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";

import { CurrentUser } from "src/common/decorator/current-user.decorator";
import { OrderStatus } from "src/generated/prisma/enums";

import { CancelOrderDto } from "./dto/cancel-order.dto";
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

    @Get()
    @ApiOperation({
        summary: "Get my orders",
        description:
            "Retrieves the authenticated user's orders with optional search, filtering, sorting, and cursor-based pagination.",
    })
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "status", required: false, enum: OrderStatus })
    @ApiQuery({
        name: "orderBy",
        required: false,
        enum: ["createdAt", "total"],
    })
    @ApiQuery({
        name: "orderDirection",
        required: false,
        enum: ["asc", "desc"],
    })
    @ApiQuery({ name: "cursorId", required: false })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async getAllMyOrders(
        @CurrentUser("sub") userId: string,
        @Query("search") search?: string,
        @Query("status", new ParseEnumPipe(OrderStatus, { optional: true }))
        status?: OrderStatus,
        @Query("orderBy") orderBy?: "createdAt" | "total",
        @Query("orderDirection") orderDirection?: "asc" | "desc",
        @Query("cursorId") cursorId?: string,
        @Query("limit", new ParseIntPipe({ optional: true })) limit = 20
    ) {
        return this.orderService.getAllMyOrders(
            userId,
            search,
            { status },
            orderBy,
            orderDirection,
            cursorId,
            limit
        );
    }

    @Get("received")
    @ApiOperation({
        summary: "Get my received orders",
        description:
            "Retrieves the authenticated user's received orders with optional search, filtering, sorting, and cursor-based pagination.",
    })
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "status", required: false, enum: OrderStatus })
    @ApiQuery({
        name: "orderBy",
        required: false,
        enum: ["createdAt", "total"],
    })
    @ApiQuery({
        name: "orderDirection",
        required: false,
        enum: ["asc", "desc"],
    })
    @ApiQuery({ name: "cursorId", required: false })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async getMyReceivedOrders(
        @CurrentUser("sub") userId: string,
        @Query("search") search?: string,
        @Query("status", new ParseEnumPipe(OrderStatus, { optional: true }))
        status?: OrderStatus,
        @Query("orderBy") orderBy?: "createdAt" | "total",
        @Query("orderDirection") orderDirection?: "asc" | "desc",
        @Query("cursorId") cursorId?: string,
        @Query("limit", new ParseIntPipe({ optional: true })) limit = 20
    ) {
        return this.orderService.getMyReceivedOrders(
            userId,
            search,
            { status },
            orderBy,
            orderDirection,
            cursorId,
            limit
        );
    }

    @Get(":orderId")
    @ApiOperation({
        summary: "Get order by ID",
        description:
            "Retrieves the details of a specific order by its ID for the authenticated user.",
    })
    @ApiParam({
        name: "orderId",
        required: true,
        type: String,
        description: "Unique identifier of the order to retrieve",
    })
    async getOrderById(
        @CurrentUser("sub") userId: string,
        @Param("orderId") orderId: string
    ) {
        return this.orderService.getOrderById(orderId, userId);
    }

    @Patch(":orderId/shipped")
    @ApiOperation({
        summary: "Mark an order as shipped",
        description: "Marks an order as shipped for the authenticated user.",
    })
    @ApiParam({
        name: "orderId",
        required: true,
        type: String,
        description: "Unique identifier of the order to mark as shipped",
    })
    async markAsShipped(
        @CurrentUser("sub") userId: string,
        @Param("orderId") orderId: string
    ) {
        return this.orderService.markAsShipped(orderId, userId);
    }

    @Patch(":orderId/delivered")
    @ApiOperation({
        summary: "Mark an order as delivered for the authenticated user",
        description: "Marks an order as delivered for the authenticated user.",
    })
    @ApiParam({
        name: "orderId",
        required: true,
        type: String,
        description: "Unique identifier of the order to mark as delivered",
    })
    async markAsDelivered(
        @CurrentUser("sub") userId: string,
        @Param("orderId") orderId: string
    ) {
        return this.orderService.markAsDelivered(orderId, userId);
    }

    @Patch(":orderId/cancel")
    @ApiOperation({
        summary: "Cancel an order",
        description: "Cancels an order for the authenticated user.",
    })
    @ApiParam({
        name: "orderId",
        required: true,
        type: String,
        description: "Unique identifier of the order to cancel",
    })
    async cancelOrder(
        @CurrentUser("sub") userId: string,
        @Param("orderId") orderId: string,
        @Body() payload: CancelOrderDto
    ) {
        return this.orderService.cancelOrder(orderId, userId, payload);
    }
}
