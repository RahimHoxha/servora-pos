import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

import { AuthGuard } from "../guards/auth.guard";
import { JwtGuard } from "../guards/jwt.guard";
import { JwtStrategy } from "../strategies/jwt-strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "../company/company.entity";
import { User } from "src/user/user.entity";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "3600s" },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Company, User]),
  ],
  providers: [JwtGuard, AuthGuard, JwtStrategy],
  exports: [JwtGuard, AuthGuard, JwtModule, JwtStrategy],
})
export class AuthGuardModule { }
