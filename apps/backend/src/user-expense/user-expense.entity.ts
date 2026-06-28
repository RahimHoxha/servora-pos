import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../product/product.entity";
import { User } from "src/user/user.entity";
import { Company } from "src/company/company.entity"; // Import company entity

export enum ExpenseType {
  PRODUCT = "PRODUCT",
  CASH = "CASH",
}

@Entity("user_expense")
export class UserExpense {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Company, { eager: true })
  company: Company;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: "enum", enum: ExpenseType })
  type: ExpenseType;

  @ManyToOne(() => Product, { nullable: true, eager: true })
  product?: Product;

  @Column({ type: "int", nullable: true })
  quantity: number;

  @Column({ type: "int", nullable: true })
  cashAmount?: number;

  @Column({ type: "text", nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
