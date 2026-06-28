import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "./user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body()
    body: {
      username: string;
      password: string;
      confirm_password: string;
      companyId: string;
    }
  ) {
    return this.userService.createUser(
      body.username,
      body.password,
      body.confirm_password,
      body.companyId
    );
  }

  @Get("company/:companyId")
  async getUsersByCompany(@Param("companyId") companyId: string) {
    return this.userService.getUsersByCompany(companyId);
  }

  @Get("company/:companyId/code/:userCode")
  getUserByCompanyAndCode(
    @Param("companyId") companyId: string,
    @Param("userCode") userCode: string
  ): Promise<User> {
    return this.userService.findByCompanyAndCode(companyId, userCode);
  }

  @Patch("/company/:companyId/change-password")
  @UseGuards(AuthGuard)
  changePassword(
    @Param("companyId") companyId: string,
    @Body()
    {
      userId,
      newPassword,
      confirmNewPassword,
    }: { userId: string; newPassword: string; confirmNewPassword: string }
  ) {
    return this.userService.changeUserPassword(
      userId,
      companyId,
      newPassword,
      confirmNewPassword
    );
  }

  @Delete(":id/company/:companyId")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string, @Param("companyId") companyId: string) {
    return this.userService.deleteUser(id, companyId);
  }
}
