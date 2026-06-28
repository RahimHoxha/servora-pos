import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductCategoryController } from "./product-category.controller";
import { ProductCategoryService } from "./product-category.service";
import { ProductCategory } from "./product-category.entity";
import { AuthGuardModule } from "src/auth-guard/auth-guard.module";
import { Company } from "../company/company.entity"; // <-- Import Company

@Module({
  imports: [
    AuthGuardModule,
    TypeOrmModule.forFeature([ProductCategory, Company]),
  ],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}
