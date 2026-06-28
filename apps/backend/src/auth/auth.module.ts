import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Company } from "src/company/company.entity";
import { CompanyModule } from "src/company/company.module";
import { JwtStrategy } from "src/strategies/jwt-strategy";
import { JwtGuard } from "src/guards/jwt.guard";
import { AuthGuardModule } from "src/auth-guard/auth-guard.module";
import { User } from "src/user/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User]),
    CompanyModule,
    AuthGuardModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtGuard],
})
export class AuthModule { }
