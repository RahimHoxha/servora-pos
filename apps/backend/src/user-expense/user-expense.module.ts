import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserExpense } from "./user-expense.entity";
import { UserExpenseService } from "./user-expense.service";
import { UserExpenseController } from "./user.expense.controller";
import { Product } from "../product/product.entity";
import { ProductStockService } from "../product-stock/product-stock.service";
import { ProductStock } from "../product-stock/product-stock.entity";
import { User } from "src/user/user.entity";
import { Company } from "src/company/company.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserExpense,
      User,
      Product,
      ProductStock,
      Company,
    ]),
  ],
  controllers: [UserExpenseController],
  providers: [UserExpenseService, ProductStockService],
})
export class UserExpenseModule {}
