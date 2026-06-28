import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TablesService } from "./tables.service";
import { TablesController } from "./tables.controller";
import { Table } from "./tables.entity";
import { TableProduct } from "./table-product.entity";
import { ProductModule } from "src/product/product.module";
import { ProductStockModule } from "src/product-stock/product-stock.module";
import { User } from "src/user/user.entity";
import { TablesGateway } from "./tables.gateway";

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, TableProduct, User]),
    ProductModule,
    ProductStockModule,
  ],
  controllers: [TablesController],
  providers: [TablesService, TablesGateway],
  // exports: [TablesGateway],
})
export class TablesModule {}
