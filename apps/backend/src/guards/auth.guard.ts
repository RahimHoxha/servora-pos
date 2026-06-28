/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CompanyRepository } from "../company/company.repository";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("CompanyRepository")
    private readonly companyRepository: CompanyRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") {
      return false;
    }

    try {
      const request: Request = context.switchToHttp().getRequest();
      const { authorization } = request.headers;

      if (!authorization || authorization.trim() === "") {
        throw new UnauthorizedException("Please provide token");
      }
      const authToken = authorization.replace(/bearer/gim, "").trim();
      const resp = await this.jwtService.verify(authToken);
      (request as any).decodedData = resp;
      return true;
    } catch (error) {
      throw new ForbiddenException(
        error.message || "session expired! Please sign In"
      );
    }
  }
}
