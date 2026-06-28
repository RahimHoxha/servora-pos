import {
  Injectable,
  BadRequestException,
  //   UnauthorizedException,
} from "@nestjs/common";
// import { RegisterDto } from "./register.dto";
import { LoginDto } from "./login.dto";
import {
  AdminCompanyLoginResponse,
  CompanyService,
} from "src/company/company.service";
// import { ChangePasswordDto } from "./change-password.dto";/
import * as bcrypt from "bcrypt";
import { getTokens } from "./utils";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AdminCompanyLoginResponse> {
    const { email, password } = loginDto;

    const existingCompany = await this.companyService.findByAdminEmail(email);

    if (!existingCompany) {
      throw new BadRequestException("Company not found!");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingCompany.admin_credentials.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Invalid email or password.");
    }

    const tokens = await getTokens(existingCompany, this.jwtService);

    return {
      company: existingCompany,
      accessToken: tokens.accessToken,
    };
  }

  async loginWithCompanyCode(code: string) {
    const company = await this.companyService.findByCompanyCode(code);
    if (!company) {
      throw new BadRequestException("Invalid company code.");
    }

    // In frontend, store the company code in localStorage
    return { success: true };
  }
}
