import {
  IsEnum,
  IsInt,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus } from "./tables.entity";
import { PartialType } from "@nestjs/mapped-types";
import { Product } from "src/product/product.entity";
import { User } from "src/user/user.entity";

class ProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;
}

export class CreateTableDto {
  @IsInt()
  tableNumber: number;

  @IsUUID()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export class TableProductResponseDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @IsInt()
  quantity: number;
}

export class TableResponseDto {
  @IsUUID()
  id: string;

  @IsInt()
  tableNumber: number;

  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableProductResponseDto)
  products: TableProductResponseDto[];

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsInt()
  sumTotal: number;

  acceptedAt: Date;
  paidAt: Date | null;
}
