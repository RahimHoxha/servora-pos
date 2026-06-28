import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
} from "@nestjs/common";
import { ProductStockService } from "./product-stock.service";
import { ProductStock } from "./product-stock.entity";

@Controller("product-stock")
export class ProductStockController {
  constructor(private readonly productStockService: ProductStockService) {}

  @Post("add")
  async addStock(
    @Body("companyId") companyId: string,
    @Body("productId") productId: string,
    @Body("quantity") quantity: number
  ): Promise<ProductStock> {
    return this.productStockService.addStock(companyId, productId, quantity);
  }

  @Put("edit/:productId")
  async editStock(
    @Param("productId") productId: string,
    @Body("companyId") companyId: string,
    @Body("quantity") quantity: number
  ): Promise<ProductStock> {
    return this.productStockService.editStock(companyId, productId, quantity);
  }

  @Delete("delete/:productId")
  async deleteStock(
    @Param("productId") productId: string,
    @Body("companyId") companyId: string
  ): Promise<void> {
    return this.productStockService.deleteStock(companyId, productId);
  }

  @Put("reduce/:productId")
  async reduceStock(
    @Param("productId") productId: string,
    @Body("companyId") companyId: string,
    @Body("quantity") quantity: number
  ): Promise<ProductStock> {
    return this.productStockService.reduceStock(companyId, productId, quantity);
  }

  @Get(":productId")
  async getStock(
    @Param("productId") productId: string,
    @Body("companyId") companyId: string
  ): Promise<ProductStock> {
    return this.productStockService.getStock(companyId, productId);
  }

  @Post("all") // Changed from GET to POST because we need companyId
  async getAllStocks(
    @Body("companyId") companyId: string
  ): Promise<ProductStock[]> {
    return this.productStockService.getAllStocks(companyId);
  }
}
