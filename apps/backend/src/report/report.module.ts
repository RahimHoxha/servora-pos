// src/reports/report.module.ts
import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserExpense } from "../user-expense/user-expense.entity";
import { Table } from "src/tables/tables.entity";
import { Report } from "./report.entity";
import { ProductStock } from "src/product-stock/product-stock.entity";
import { TableProduct } from "src/tables/table-product.entity";
import { Company } from "src/company/company.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Table,
      UserExpense,
      ProductStock,
      Report,
      TableProduct,
      Company,
    ]),
  ],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
