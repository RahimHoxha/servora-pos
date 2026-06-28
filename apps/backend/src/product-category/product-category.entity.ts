import { Product } from "src/product/product.entity";
import { Company } from "src/company/company.entity"; // ⬅️ import Company
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";

@Entity("product_categories")
export class ProductCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToMany(() => Product, (product) => product.product_categories)
  products: Product[];

  @ManyToOne(() => Company) // ⬅️ Add company relation
  company: Company;
}
