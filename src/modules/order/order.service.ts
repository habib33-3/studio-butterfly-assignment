import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { generateOrderId } from "src/common/utils/generate-order-id";
import { Prisma } from "src/generated/prisma/client";
import { OrderStatus } from "src/generated/prisma/enums";

import { CancelOrderDto } from "./dto/cancel-order.dto";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(userId: string, payload: CreateOrderDto) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: {
                    id: payload.productId,
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    price: true,
                    userId: true,
                },
            });

            if (!product) {
                throw new NotFoundException(
                    `Product not found with id ${payload.productId}`
                );
            }

            if (product.userId === userId) {
                throw new BadRequestException(
                    "You cannot order your own product"
                );
            }

            const updated = await tx.product.updateMany({
                where: {
                    id: payload.productId,
                    stockQuantity: {
                        gte: payload.quantity,
                    },
                },
                data: {
                    stockQuantity: {
                        decrement: payload.quantity,
                    },
                },
            });

            if (updated.count === 0) {
                throw new BadRequestException("Insufficient stock");
            }

            const orderId = generateOrderId(product.name, product.category);

            const total = payload.quantity * Number(product.price);

            return tx.order.create({
                data: {
                    orderId,
                    userId,
                    productId: payload.productId,
                    quantity: payload.quantity,
                    address: payload.address,
                    total,
                },
            });
        });
    }

    async getAllMyOrders(
        userId: string,
        search?: string,
        filter?: {
            status?: OrderStatus;
        },
        orderBy: "createdAt" | "total" = "createdAt",
        orderDirection: "asc" | "desc" = "desc",
        cursorId?: string,
        limit = 20
    ) {
        search = search?.trim();
        limit = Math.min(limit, 100);

        const where: Prisma.OrderWhereInput = {
            userId,
        };

        if (search) {
            where.OR = [
                {
                    orderId: {
                        contains: search,
                    },
                },
                {
                    product: {
                        name: {
                            contains: search,
                        },
                    },
                },
            ];
        }

        if (filter?.status) {
            where.status = filter.status;
        }

        const orders = await this.prisma.order.findMany({
            where,
            take: limit + 1,
            skip: cursorId ? 1 : 0,
            cursor: cursorId ? { id: cursorId } : undefined,
            orderBy: [
                {
                    [orderBy]: orderDirection,
                },
                {
                    id: "asc",
                },
            ],
        });

        const hasNextPage = orders.length > limit;

        if (hasNextPage) {
            orders.pop();
        }

        return {
            data: orders,
            hasNextPage,
        };
    }

    async getMyReceivedOrders(
        userId: string,
        search?: string,
        filter?: {
            status?: OrderStatus;
        },
        orderBy: "createdAt" | "total" = "createdAt",
        orderDirection: "asc" | "desc" = "desc",
        cursorId?: string,
        limit = 20
    ) {
        search = search?.trim();
        limit = Math.min(limit, 100);

        const where: Prisma.OrderWhereInput = {
            product: {
                userId,
            },
        };

        if (search) {
            where.OR = [
                {
                    orderId: {
                        contains: search,
                    },
                },
                {
                    product: {
                        name: {
                            contains: search,
                        },
                    },
                },
            ];
        }

        if (filter?.status) {
            where.status = filter.status;
        }

        const orders = await this.prisma.order.findMany({
            where,
            take: limit + 1,
            skip: cursorId ? 1 : 0,
            cursor: cursorId ? { id: cursorId } : undefined,
            orderBy: [
                {
                    [orderBy]: orderDirection,
                },
                {
                    id: "asc",
                },
            ],
        });

        const hasNextPage = orders.length > limit;

        if (hasNextPage) {
            orders.pop();
        }

        return {
            data: orders,
            hasNextPage,
        };
    }

    async getOrderById(orderId: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: {
                orderId,
                OR: [
                    {
                        userId,
                    },
                    {
                        product: {
                            userId,
                        },
                    },
                ],
            },
            select: {
                id: true,
                orderId: true,
                quantity: true,
                address: true,
                total: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        price: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order not found with id ${orderId}`);
        }

        return order;
    }

    async markAsShipped(orderId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const { count } = await tx.order.updateMany({
                where: {
                    orderId,
                    status: OrderStatus.PENDING,
                    product: {
                        userId,
                    },
                },
                data: {
                    status: OrderStatus.SHIPPED,
                    shippedAt: new Date(),
                },
            });

            if (count === 0) {
                const exists = await tx.order.findFirst({
                    where: {
                        orderId,
                        product: {
                            userId,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

                if (!exists) {
                    throw new NotFoundException(
                        `Order not found with id ${orderId}`
                    );
                }

                throw new ConflictException("Order has already been processed");
            }

            return {
                message: "Order marked as shipped successfully",
            };
        });
    }

    async markAsDelivered(orderId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const { count } = await tx.order.updateMany({
                where: {
                    orderId,
                    userId,
                    status: OrderStatus.SHIPPED,
                },
                data: {
                    status: OrderStatus.DELIVERED,
                    deliveredAt: new Date(),
                },
            });

            if (count === 0) {
                const exists = await tx.order.findFirst({
                    where: {
                        orderId,
                        userId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!exists) {
                    throw new NotFoundException(
                        `Order not found with id ${orderId}`
                    );
                }

                throw new ConflictException("Order has already been processed");
            }

            return {
                message: "Order marked as delivered successfully",
            };
        });
    }

    async cancelOrder(
        orderId: string,
        userId: string,
        payload: CancelOrderDto
    ) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: {
                    orderId,
                    userId,
                },
            });

            if (!order) {
                throw new NotFoundException(
                    `Order not found with id ${orderId}`
                );
            }

            const { count } = await tx.order.updateMany({
                where: {
                    id: order.id,
                    status: OrderStatus.PENDING,
                },
                data: {
                    status: OrderStatus.CANCELED,
                    canceledAt: new Date(),
                    canceledReason: payload.cancelReason,
                },
            });

            if (count === 0) {
                throw new ConflictException("Order has already been processed");
            }

            await tx.product.update({
                where: {
                    id: order.productId,
                },
                data: {
                    stockQuantity: {
                        increment: order.quantity,
                    },
                },
            });

            return {
                message: "Order canceled successfully",
            };
        });
    }
}
