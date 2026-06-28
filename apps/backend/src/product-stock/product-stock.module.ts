import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductStock } from "./product-stock.entity";
import { ProductStockService } from "./product-stock.service";
import { ProductStockController } from "./product-stock.controller";
import { Company } from "src/company/company.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ProductStock, Company])],
  controllers: [ProductStockController],
  providers: [ProductStockService],
  exports: [ProductStockService],
})
export class ProductStockModule {}
