import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from "class-validator";
import { ExpenseType } from "./user-expense.entity";

export class CreateExpenseDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  userId: string;

  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ValidateIf((o) => o.type === ExpenseType.PRODUCT)
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @ValidateIf((o) => o.type === ExpenseType.CASH)
  @IsOptional()
  cashAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExpenseDto {
  @IsUUID()
  companyId: string; // added this too

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Min(0)
  cashAmount?: number;
}
