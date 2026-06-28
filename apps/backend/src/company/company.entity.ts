import { Product } from "src/product/product.entity";
import { Report } from "src/report/report.entity";
import { Table } from "src/tables/tables.entity";
import { User } from "src/user/user.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  code: string; // Unique Company Code

  @Column("jsonb") // Store as JSON in the DB
  admin_credentials: { email: string; password: string };

  @Column({ nullable: true })
  logo?: string;

  @Column({ default: 16 })
  tableCount: number;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @OneToMany(() => Table, (table) => table.company)
  tables: Table[];

  @OneToMany(() => Report, (product) => product.company)
  reports: Report[];
}
