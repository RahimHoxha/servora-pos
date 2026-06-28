import { Company } from "src/company/company.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  reportName: string;

  @Column({ type: "boolean", default: false })
  isFinished: boolean;

  @Column({ type: "varchar", length: 500 })
  filePath: string;

  @Column({ type: "int", default: 0 })
  invoicesTotalPrice: number;

  @Column({ type: "int", default: 0 })
  expensesTotalPrice: number;

  @Column({ type: "int", default: 0 })
  productDifferencesTotalPrice: number;

  @Column({
    type: "json",
    nullable: true,
  })
  productsWithStocks: { productId: string; stock: number }[];

  @ManyToOne(() => Company, (company) => company.reports)
  @JoinColumn()
  company: Company;

  @CreateDateColumn()
  createdAt: Date;
}
