import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  Delete,
} from "@nestjs/common";
import { UserExpenseService } from "./user-expense.service";
import { CreateExpenseDto, UpdateExpenseDto } from "./create-user-expense.dto";
import { UserExpense } from "./user-expense.entity";

@Controller("user-expense")
export class UserExpenseController {
  constructor(private readonly userExpenseService: UserExpenseService) {}

  @Post("create")
  async createExpense(@Body() dto: CreateExpenseDto): Promise<UserExpense> {
    return this.userExpenseService.createExpense(dto);
  }

  @Patch(":expenseId/update")
  async updateExpense(
    @Param("expenseId") expenseId: string,
    @Body() dto: UpdateExpenseDto
  ): Promise<UserExpense> {
    return this.userExpenseService.updateExpense(expenseId, dto);
  }

  @Get(":userId")
  async getExpenses(
    @Param("userId") userId: string,
    @Query("companyId") companyId: string,
    @Query("date") date?: string
  ): Promise<UserExpense[]> {
    return this.userExpenseService.getUserExpenses(companyId, userId, date);
  }

  @Get()
  async getAllExpenses(
    @Query("companyId") companyId: string
  ): Promise<UserExpense[]> {
    return this.userExpenseService.getAllExpenses(companyId);
  }

  @Delete(":id")
  async deleteUserExpense(
    @Param("id") id: string,
    @Query("companyId") companyId: string
  ): Promise<void> {
    return this.userExpenseService.deleteUserExpense(id, companyId);
  }
}
