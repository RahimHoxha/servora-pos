import { TableProduct } from "src/tables/table-product.entity";

export class MonthlyReportDto {
    invoices: Array<{
        username: string;
        table: number;
        products: TableProduct[]
        totalPrice: number;
        createdAt: Date | null;
        paidAt: Date | null;
    }>;

    userExpenses: Array<{
        username: string;
        type: string;
        price: number;
        date: string;
        description: string;
    }>;

    stockCount: (string | number)[][]
}