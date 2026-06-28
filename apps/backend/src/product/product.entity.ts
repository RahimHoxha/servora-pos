import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProductCategory } from "../product-category/product-category.entity";
import { Company } from "../company/company.entity"; // <-- Import Company

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @ManyToMany(() => ProductCategory, (category) => category.products)
  @JoinTable()
  product_categories: ProductCategory[];

  @Column("int")
  price: number;

  @Column({ type: "varchar", length: 5, nullable: true })
  availableFromTime?: string | null;

  @Column({ type: "varchar", length: 5, nullable: true })
  availableUntilTime?: string | null;

  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn()
  company: Company; // <-- Add relation to Company

  @DeleteDateColumn()
  deletedAt: Date | null;
}
