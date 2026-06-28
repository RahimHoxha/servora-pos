import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { Product } from "./product.entity";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() createDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createDto);
  }

  @Get()
  async findAll(@Query("companyId") companyId: string): Promise<Product[]> {
    return this.productService.findAll(companyId);
  }

  @Get(":id")
  async findById(
    @Param("id") id: string,
    @Query("companyId") companyId: string
  ): Promise<Product> {
    return this.productService.findById(id, companyId);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param("id") id: string,
    @Query("companyId") companyId: string,
    @Body() updateDto: UpdateProductDto
  ): Promise<Product> {
    return this.productService.updateProduct(id, companyId, updateDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Param("id") id: string,
    @Query("companyId") companyId: string
  ): Promise<void> {
    await this.productService.deleteProduct(id, companyId);
  }

  @Put(":id/restore")
  @UseGuards(AuthGuard)
  async restoreProduct(
    @Param("id") id: string,
    @Query("companyId") companyId: string
  ): Promise<void> {
    await this.productService.restoreProduct(id, companyId);
  }
}
