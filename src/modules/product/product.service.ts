import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";

import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}

    async createProduct(payload: CreateProductDto) {
        const product = await this.prisma.product.create({
            data: {
                name: payload.name,
                price: payload.price,
                category: payload.category,
                stockQuantity: payload.quantity,
            },
        });

        return product;
    }
}
