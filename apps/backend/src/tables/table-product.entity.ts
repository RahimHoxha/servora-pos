import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Table } from "./tables.entity";
import { Product } from "src/product/product.entity";

@Entity("table_products")
export class TableProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Table, (table) => table.products, { onDelete: "CASCADE" })
  table: Table;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column({ type: "int" })
  quantity: number;
}
