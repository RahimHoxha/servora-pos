import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { TableProduct } from "./table-product.entity";
import { User } from "src/user/user.entity";
import { Company } from "src/company/company.entity";

export enum OrderStatus {
  PAID = "PAID",
  IN_PROGRESS = "IN_PROGRESS",
}

@Entity("tables")
export class Table {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int" })
  tableNumber: number;

  @ManyToOne(() => User, (user) => user.tables, { nullable: false })
  user: User;

  @OneToMany(() => TableProduct, (tableProduct) => tableProduct.table, {
    eager: true,
  })
  products: TableProduct[];

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.IN_PROGRESS })
  status: OrderStatus;

  @Column({ type: "int" })
  sumTotal: number;

  @CreateDateColumn()
  acceptedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date | null;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;
}
