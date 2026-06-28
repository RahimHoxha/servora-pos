import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductCategoryModule } from "./product-category/product-category.module";
import { ProductModule } from "./product/product.module";
import { ProductStockModule } from "./product-stock/product-stock.module";
import { TablesModule } from "./tables/tables.module";
import { TableProduct } from "./tables/table-product.entity";
import { UserExpenseModule } from "./user-expense/user-expense.module";
import { ReportModule } from "./report/report.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { CompanyModule } from "./company/company.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      ssl:
        process.env.ENVIRONMENT === "local"
          ? undefined
          : {
              rejectUnauthorized: false,
            },
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "..", "dist", "report", "reports"), // Path to the reports folder
      serveRoot: "/reports", // Optional: Access your reports with /reports/filename.pdf
    }),
    AuthModule,
    ProductModule,
    ProductCategoryModule,
    ProductStockModule,
    TablesModule,
    TableProduct,
    UserExpenseModule,
    ReportModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
