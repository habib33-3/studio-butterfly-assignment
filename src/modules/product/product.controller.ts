import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
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

    @Get()
    @ApiOperation({
        summary: "Get all products",
    })
    @ApiQuery({
        name: "search",
        required: false,
        description: "Search products by name",
    })
    @ApiQuery({
        name: "cursorId",
        required: false,
        description: "Cursor ID for pagination",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number,
        example: 10,
    })
    @ApiQuery({
        name: "category",
        required: false,
        description: "Filter by category",
    })
    @ApiQuery({
        name: "orderBy",
        required: false,
        enum: ["createdAt", "price", "quantity"],
    })
    @ApiQuery({
        name: "orderDirection",
        required: false,
        enum: ["asc", "desc"],
    })
    async getAllProducts(
        @Query("search") search?: string,
        @Query("cursorId") cursorId?: string,
        @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
        @Query("category") category?: string,
        @Query(
            "orderBy",
            new ParseEnumPipe(["createdAt", "price", "quantity"], {
                optional: true,
            })
        )
        orderBy: "createdAt" | "price" | "quantity" = "createdAt",
        @Query(
            "orderDirection",
            new ParseEnumPipe(["asc", "desc"], {
                optional: true,
            })
        )
        orderDirection: "asc" | "desc" = "desc"
    ) {
        return this.productService.getAllProducts(
            cursorId,
            search,
            limit,
            { category },
            orderBy,
            orderDirection
        );
    }

    @Get(":id")
    @ApiParam({
        name: "id",
        type: String,
        description: "Unique identifier of the product to retrieve",
    })
    @ApiOperation({
        summary: "Get a product by ID",
        description: "Retrieves a product by its unique identifier.",
    })
    async getProductById(@Param("id") id: string) {
        return this.productService.getProductById(id);
    }

    @Patch(":id")
    @ApiParam({
        name: "id",
        type: String,
        description: "Unique identifier of the product to update",
    })
    @ApiOperation({
        summary: "Update a product by ID",
        description:
            "Updates a product's details by its unique identifier. You can update the name, category, price, and stock quantity.",
    })
    async updateProduct(
        @Param("id") id: string,
        @Body() payload: UpdateProductDto
    ) {
        return this.productService.updateProduct(id, payload);
    }

    @Delete(":id")
    @ApiParam({
        name: "id",
        type: String,
        description: "Unique identifier of the product to delete",
    })
    @ApiOperation({
        summary: "Delete a product by ID",
        description: "Deletes a product by its unique identifier.",
    })
    async deleteProduct(@Param("id") id: string) {
        return this.productService.deleteProduct(id);
    }
}
