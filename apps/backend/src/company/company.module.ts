import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "./company.entity";
import { CompanyRepository } from "./company.repository";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";
import { AuthGuardModule } from "src/auth-guard/auth-guard.module";
import { User } from "src/user/user.entity";
import { Table } from "src/tables/tables.entity";
@Module({
  imports: [
    AuthGuardModule,
    TypeOrmModule.forFeature([Company, User, Table]),
  ],
  providers: [CompanyService, CompanyRepository],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
