import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { CompanyService } from "src/company/company.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly companyService: CompanyService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post("login-with-code")
  async loginWithCompanyCode(
    @Body("code") code: string
  ): Promise<{ success: boolean }> {
    const company = await this.companyService.findByCompanyCode(code);
    if (!company) {
      throw new BadRequestException("Invalid company code.");
    }

    return { success: true };
  }
}
