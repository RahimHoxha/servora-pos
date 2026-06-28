import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  Req,
  UseGuards,
  Delete,
  Patch,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { Company } from "./company.entity";
import { AuthGuard } from "src/guards/auth.guard";
import { ChangeAdminPasswordDto, UpdateCompanyDto } from "./company.dto";
@Controller("companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /** Create a new company */
  @Post()
  async createCompany(@Body() companyData: Partial<Company>): Promise<Company> {
    return this.companyService.createCompany(companyData);
  }

  @Post(":id/tables/add")
  @UseGuards(AuthGuard)
  addTableSlot(@Param("id") id: string) {
    return this.companyService.addTableSlot(id);
  }

  @Delete(":id/tables/remove")
  @UseGuards(AuthGuard)
  removeTableSlot(@Param("id") id: string) {
    return this.companyService.removeTableSlot(id);
  }

  @Post(":id")
  @UseGuards(AuthGuard)
  updateCompany(
    @Param("id") id: string,
    @Body() updateCompanyDto: UpdateCompanyDto
  ) {
    return this.companyService.updateCompany(id, updateCompanyDto);
  }

  @Patch(":id/admin-password")
  @UseGuards(AuthGuard)
  changeAdminPassword(
    @Param("id") id: string,
    @Body() body: ChangeAdminPasswordDto,
    @Req() request
  ) {
    const tokenCompanyId = request.decodedData.id as string;

    if (!tokenCompanyId || tokenCompanyId !== id) {
      throw new BadRequestException("Invalid company.");
    }

    return this.companyService.changeAdminPassword(
      id,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword
    );
  }

  /** Get a company by its unique code */
  @Get("/code/:code")
  async getCompanyByCode(@Param("code") code: string): Promise<Company | null> {
    return this.companyService.findByCompanyCode(code);
  }

  @Get("/my-company")
  @UseGuards(AuthGuard)
  async getMyCompany(@Req() request): Promise<Company | null> {
    const id = request.decodedData.id as string;
    if (!id) {
      throw new BadRequestException("Invalid company.");
    }
    return this.companyService.findByCompanyId(id);
  }
}
