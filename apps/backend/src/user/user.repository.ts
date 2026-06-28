import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>
  ) {}

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findAllByCompany(companyId: string): Promise<User[]> {
    return this.repo.find({
      where: {
        company: { id: companyId },
      },
      select: {
        id: true,
        username: true,
        deletedAt: true,
      },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id: userId },
      relations: ["company"],
    });
  }

  async findOneByIdAndCompany(
    userId: string,
    companyId: string
  ): Promise<User | null> {
    return this.repo.findOne({
      where: {
        id: userId,
        company: { id: companyId },
      },
    });
  }

  async findByCompanyAndCode(
    companyId: string,
    userCode: string
  ): Promise<User | null> {
    return await this.repo.findOne({
      where: {
        company: {
          id: companyId,
        },
        password: userCode,
      },
    });
  }

  async isPasswordTakenInCompany(
    companyId: string,
    password: string,
    excludeUserId?: string
  ): Promise<boolean> {
    const query = this.repo
      .createQueryBuilder("user")
      .where("user.password = :password", { password })
      .andWhere("user.companyId = :companyId", { companyId });

    if (excludeUserId) {
      query.andWhere("user.id != :excludeUserId", { excludeUserId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.repo.update({ id: userId }, { password: newPassword });
  }

  async findByCompanyIdAndPassword(
    companyId: string,
    password: string
  ): Promise<User | null> {
    return this.repo.findOne({
      where: {
        company: {
          id: companyId,
        },
        password,
      },
    });
  }

  async softDelete(userId: string, companyId: string): Promise<void> {
    const user = await this.findOneByIdAndCompany(userId, companyId);
    if (user) await this.repo.softDelete(user.id);
  }
}
