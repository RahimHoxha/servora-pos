import { Company } from "src/company/company.entity";
import { Table } from "src/tables/tables.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";

@Entity()
@Unique(["company", "username"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Table, (table) => table.user)
  tables: Table[];

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn()
  company: Company;
}
