import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Company } from "src/company/company.entity";
import { CompanyRepository } from "src/company/company.repository";
import { AuthGuardModule } from "src/auth-guard/auth-guard.module";

@Module({
  imports: [AuthGuardModule, TypeOrmModule.forFeature([User, Company])],
  providers: [UserRepository, CompanyRepository, UserService],
  controllers: [UserController],
})
export class UserModule { }
