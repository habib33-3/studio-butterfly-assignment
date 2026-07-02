import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { CreateProductDto } from "./dto/create-product.dto";
import { ProductService } from "./product.service";

@ApiTags("Products")
@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @ApiOperation({
        summary: "Create a product",
        description:
            "Creates a new product with its name, category, price, and stock quantity.",
    })
    async createProduct(@Body() payload: CreateProductDto) {
        return this.productService.createProduct(payload);
    }
}
