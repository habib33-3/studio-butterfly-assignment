import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { generateOrderId } from "src/common/utils/generate-order-id";

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
}
