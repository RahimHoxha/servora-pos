/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { UserExpense, ExpenseType } from "./user-expense.entity";
import { CreateExpenseDto, UpdateExpenseDto } from "./create-user-expense.dto";
import { Product } from "../product/product.entity";
import { ProductStockService } from "../product-stock/product-stock.service";
import { User } from "src/user/user.entity";
import { Company } from "src/company/company.entity";

const dayjs = require("dayjs");

@Injectable()
export class UserExpenseService {
  constructor(
    @InjectRepository(UserExpense)
    private readonly userExpenseRepository: Repository<UserExpense>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    private readonly productStockService: ProductStockService
  ) {}

  async createExpense(dto: CreateExpenseDto): Promise<UserExpense> {
    const company = await this.companyRepository.findOne({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException("Company not found.");
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    let product: Product | undefined;
    if (dto.type === ExpenseType.PRODUCT) {
      if (!dto.productId)
        throw new BadRequestException(
          "Product ID is required for PRODUCT expenses."
        );

      product =
        (await this.productRepository.findOne({
          where: { id: dto.productId },
        })) || undefined;
      if (!product) throw new NotFoundException("Product not found.");

      await this.productStockService.reduceStock(
        dto.companyId,
        dto.productId,
        dto.quantity
      );
    }

    const expense = this.userExpenseRepository.create({
      company,
      user,
      type: dto.type,
      product,
      quantity: dto.quantity,
      cashAmount: dto.cashAmount,
      description: dto.description,
    });

    return this.userExpenseRepository.save(expense);
  }

  async getAllExpenses(companyId: string): Promise<UserExpense[]> {
    return await this.userExpenseRepository.find({
      where: { company: { id: companyId } },
      relations: ["user", "product"],
    });
  }

  async updateExpense(
    expenseId: string,
    dto: UpdateExpenseDto
  ): Promise<UserExpense> {
    const expense = await this.userExpenseRepository.findOne({
      where: { id: expenseId, company: { id: dto.companyId } },
    });
    if (!expense) {
      throw new NotFoundException("Expense not found.");
    }

    if (dto.quantity !== undefined) {
      expense.quantity = dto.quantity;
    }

    if (dto.cashAmount !== undefined) {
      expense.cashAmount = dto.cashAmount;
    }

    return this.userExpenseRepository.save(expense);
  }

  async getUserExpenses(
    companyId: string,
    userId: string,
    date?: string
  ): Promise<UserExpense[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const whereCondition: any = {
      company: { id: companyId },
      user: { id: userId },
    };

    if (date) {
      if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
        throw new BadRequestException("Invalid date format. Use YYYY-MM-DD.");
      }

      const startOfDay = dayjs(date).startOf("day").toDate();
      const endOfDay = dayjs(date).endOf("day").toDate();

      whereCondition.createdAt = Between(startOfDay, endOfDay);
    }

    return await this.userExpenseRepository.find({
      where: whereCondition,
    });
  }

  async deleteUserExpense(id: string, companyId: string): Promise<void> {
    const expense = await this.userExpenseRepository.findOne({
      where: { id, company: { id: companyId } },
      relations: ["user", "product"],
    });
    if (!expense) {
      throw new NotFoundException("Expense not found");
    }

    if (expense.type === ExpenseType.PRODUCT && expense.product?.id) {
      if (!expense.quantity) {
        throw new BadRequestException("Invalid quantity for PRODUCT expense");
      }

      await this.productStockService.addStock(
        companyId,
        expense.product?.id,
        expense.quantity
      );
    }

    await this.userExpenseRepository.remove(expense);
  }
}
