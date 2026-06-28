import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { Company } from "./company.entity";
import { generateUniqueCompanyCode } from "./company-code.util";

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company) private readonly repo: Repository<Company>
  ) {}

  async countCompanies(): Promise<number> {
    return this.repo.count();
  }

  findByCode(code: string): Promise<Company | null> {
    return this.repo.findOne({ where: { code: code.toString() } });
  }

  findByAdminEmail(email: string): Promise<Company | null> {
    return this.repo
      .createQueryBuilder("company")
      .where(`company.admin_credentials ->> 'email' = :email`, { email })
      .getOne();
  }

  findById(id: string): Promise<Company | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    const code = await generateUniqueCompanyCode(this.repo);
    const company = this.repo.create({
      ...companyData,
      code,
    });
    return this.repo.save(company);
  }

  async findAllCompanies(): Promise<Company[]> {
    return this.repo.find();
  }

  async save(data: DeepPartial<Company>): Promise<Company> {
    return await this.repo.save(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
