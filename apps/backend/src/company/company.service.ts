import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanyRepository } from "./company.repository";
import { Company } from "./company.entity";
import * as bcrypt from "bcrypt";
import { UpdateCompanyDto } from "./company.dto";
import { OrderStatus, Table } from "src/tables/tables.entity";

const DEFAULT_TABLE_COUNT = 16;
const MAX_TABLE_COUNT = 50;
export interface AdminCompanyLoginResponse {
  accessToken: string;
  company: Company;
}

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>
  ) {}

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    if (!companyData.admin_credentials?.password) {
      throw new BadRequestException("Admin password is required.");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(
      companyData.admin_credentials.password,
      10
    );

    const company = this.companyRepository.createCompany({
      ...companyData,
      admin_credentials: {
        email: companyData.admin_credentials.email,
        password: hashedPassword, // Store hashed password
      },
    });

    return company;
  }

  async updateCompany(
    id: string,
    updateDto: UpdateCompanyDto
  ): Promise<Company> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updated = Object.assign(company, updateDto);
    return this.companyRepository.save(updated);
  }

  async findByCompanyCode(code: string): Promise<Company | null> {
    return this.companyRepository.findByCode(code);
  }

  async findByCompanyId(id: string): Promise<Company | null> {
    return this.companyRepository.findById(id);
  }

  async findByAdminEmail(email: string): Promise<Company | null> {
    return this.companyRepository.findByAdminEmail(email);
  }

  async addTableSlot(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const currentCount = company.tableCount ?? DEFAULT_TABLE_COUNT;

    if (currentCount >= MAX_TABLE_COUNT) {
      throw new BadRequestException(
        `Maximum number of tables is ${MAX_TABLE_COUNT}.`
      );
    }

    company.tableCount = currentCount + 1;
    return this.companyRepository.save(company);
  }

  async removeTableSlot(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const currentCount = company.tableCount ?? DEFAULT_TABLE_COUNT;

    if (currentCount <= 1) {
      throw new BadRequestException("At least one table is required.");
    }

    const activeOrder = await this.tablesRepository.findOne({
      where: {
        company: { id: companyId },
        tableNumber: currentCount,
        status: OrderStatus.IN_PROGRESS,
      },
    });

    if (activeOrder) {
      throw new BadRequestException(
        `Table ${currentCount} has an active order. Pay or move it before removing.`
      );
    }

    company.tableCount = currentCount - 1;
    return this.companyRepository.save(company);
  }

  async changeAdminPassword(
    companyId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<{ success: true }> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      company.admin_credentials.password
    );

    if (!isCurrentValid) {
      throw new BadRequestException("Current password is incorrect.");
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException("Passwords do not match.");
    }

    if (newPassword.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters.");
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      company.admin_credentials.password
    );

    if (isSamePassword) {
      throw new BadRequestException(
        "New password must be different from the current password."
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    company.admin_credentials = {
      ...company.admin_credentials,
      password: hashedPassword,
    };

    await this.companyRepository.save(company);

    return { success: true };
  }
}
