import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { ProductService } from "./product.service";
import { ProductCategory } from "../product-category/product-category.entity";
import { ProductController } from "./product.controller";
import { Company } from "../company/company.entity"; // <-- Import Company
import { AuthGuardModule } from "src/auth-guard/auth-guard.module";

@Module({
  imports: [
    AuthGuardModule,
    TypeOrmModule.forFeature([Product, ProductCategory, Company]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
