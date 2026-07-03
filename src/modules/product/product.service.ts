import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { Prisma } from "src/generated/prisma/client";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}

    async createProduct(payload: CreateProductDto, userId: string) {
        const product = await this.prisma.product.create({
            data: {
                name: payload.name,
                price: payload.price,
                category: payload.category,
                stockQuantity: payload.stockQuantity,
                userId,
            },
        });

        return product;
    }

    async getAllProducts(
        cursorId?: string,
        search?: string,
        limit = 10,
        filter?: {
            category?: string;
        },
        orderBy: "createdAt" | "price" | "quantity" = "createdAt",
        orderDirection: "asc" | "desc" = "desc"
    ) {
        limit = Math.max(1, Math.min(limit, 100));

        search = search?.trim();

        const where: Prisma.ProductWhereInput = {};

        if (search) {
            where.name = {
                contains: search,
            };
        }

        if (filter?.category) {
            where.category = filter.category;
        }

        const products = await this.prisma.product.findMany({
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

        const hasNextPage = products.length > limit;

        if (hasNextPage) {
            products.pop();
        }

        return {
            data: products,
            nextCursor: hasNextPage ? products[products.length - 1].id : null,
        };
    }

    async getProductById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                category: true,
                price: true,
                stockQuantity: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async updateProduct(id: string, payload: UpdateProductDto, userId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id, userId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const updateData = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as Prisma.ProductUpdateInput;

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException("No fields provided to update");
        }

        return this.prisma.product.update({
            where: { id, userId },
            data: updateData,
        });
    }

    async deleteProduct(id: string, userId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id, userId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.prisma.product.delete({
            where: { id, userId },
        });

        return { message: `Product with ID ${id} has been deleted` };
    }
}
