import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { CompanyRepository } from "src/company/company.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async createUser(
    username: string,
    password: string,
    confirm_password: string,
    companyId: string
  ): Promise<User> {
    if (password.length !== 4) throw new Error("Password must be 4 digits");

    const company = await this.companyRepository.findById(companyId);
    if (!company) throw new Error("Company not found");

    const existingUserWithPassword =
      await this.userRepository.findByCompanyIdAndPassword(companyId, password);

    if (existingUserWithPassword) {
      throw new Error("Password already in use within this company");
    }

    if (password !== confirm_password) {
      throw new Error("Passwords don't match");
    }

    return this.userRepository.createUser({ username, password, company });
  }

  async changeUserPassword(
    userId: string,
    companyId: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<User> {
    if (newPassword.length !== 4) {
      throw new Error("Password must be 4 digits");
    }

    if (confirmNewPassword !== newPassword) {
      throw new Error("Password don't match");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user?.company?.id !== companyId) {
      throw new Error("User does not belong to the specified company");
    }

    if (user.password === newPassword) {
      throw new Error("New password must be different from the current one");
    }

    const isPasswordTaken = await this.userRepository.isPasswordTakenInCompany(
      companyId,
      newPassword,
      userId
    );

    if (isPasswordTaken) {
      throw new Error("Password already in use within this company");
    }

    await this.userRepository.updatePassword(userId, newPassword);

    const updatedUser = await this.userRepository.findById(userId);
    if (!updatedUser) {
      throw new Error("Failed to retrieve updated user");
    }

    return updatedUser;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return this.userRepository.findAllByCompany(companyId);
  }

  async findByCompanyAndCode(
    companyId: string,
    userCode: string
  ): Promise<User> {
    const user = await this.userRepository.findByCompanyAndCode(
      companyId,
      userCode
    );
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }
    return user;
  }

  async deleteUser(id: string, companyId: string): Promise<void> {
    return this.userRepository.softDelete(id, companyId);
  }
}
