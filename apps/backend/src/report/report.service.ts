// src/reports/report.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { ExpenseType, UserExpense } from "../user-expense/user-expense.entity";
import { Table } from "src/tables/tables.entity";
import { MonthlyReportDto } from "./report.dto";
import * as pdfmake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { StockCheckDto } from "./report.controller";
import { ProductStock } from "src/product-stock/product-stock.entity";
import { Report } from "./report.entity";
import { TableProduct } from "src/tables/table-product.entity";
import { Company } from "src/company/company.entity";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const dayjs = require("dayjs");

// Type assertion to ensure pdfmake.vfs is recognized correctly
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
(pdfmake as any).vfs = (pdfFonts as any).pdfMake?.vfs;

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Table)
    private readonly invoiceRepository: Repository<Table>,
    @InjectRepository(UserExpense)
    private readonly userExpenseRepository: Repository<UserExpense>,
    @InjectRepository(ProductStock)
    private readonly productStockRepository: Repository<ProductStock>,
    @InjectRepository(TableProduct)
    private readonly tableProductRepository: Repository<TableProduct>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  // Fetch necessary data for the report
  async generateMonthlyReport(
    stockCheckData: StockCheckDto[],
    companyId: string
  ): Promise<MonthlyReportDto> {
    // Fetch data directly using the entities
    const invoices = await this.invoiceRepository.find({
      relations: ["user", "products", "company"],
      order: {
        paidAt: "DESC", // Newest to oldest
      },
      where: {
        company: {
          id: companyId,
        },
      },
    });
    const userExpenses = await this.userExpenseRepository.find({
      relations: ["user", "company"],
      order: {
        updatedAt: "DESC", // Newest to oldest
      },
      where: {
        company: {
          id: companyId,
        },
      },
    });

    const differences = await Promise.all(
      stockCheckData.map(async (item) => {
        const foundProductStock = await this.productStockRepository.findOne({
          where: {
            productId: item?.product?.productId,
            companyId,
          },
        });

        if (foundProductStock) {
          return [
            item?.product?.name + ` (${item?.product?.price} Den)`,
            foundProductStock?.quantity,
            item?.quantity,
            -(foundProductStock.quantity - item?.quantity),
            -(
              (foundProductStock.quantity - item?.quantity) *
              item.product.price
            ),
          ];
        }
        return [
          item?.product?.name + ` (${item?.product?.price} Den)`,
          0,
          item?.quantity,
          item.quantity,
          item.product.price * item.quantity,
        ];
      })
    );

    // Structure data for the report without needing to map to DTOs
    return {
      invoices: invoices.map((invoice) => ({
        username: invoice.user.username,
        table: invoice.tableNumber,
        products: invoice.products,
        totalPrice: invoice.sumTotal,
        createdAt: invoice.acceptedAt,
        paidAt: invoice.paidAt,
      })),
      userExpenses: userExpenses.map((expense) => ({
        username: expense?.user?.username,
        type:
          expense?.type === ExpenseType.CASH
            ? "Cash"
            : expense?.quantity + " x " + expense?.product?.name,
        date:
          dayjs(expense?.updatedAt).format("DD/MM/YYYY") +
          "\n" +
          new Date(expense?.updatedAt ?? "")?.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        price:
          expense?.type === ExpenseType.CASH
            ? Number(expense?.cashAmount)
            : expense?.quantity * Number(expense?.product?.price || 0),
        description: expense.description ?? "/",
      })),
      stockCount: differences,
    };
  }

  generatePdf(reportData: MonthlyReportDto): any {
    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text: "Raporti i " + dayjs().format("DD/MM/YYYY"),
          style: "header",
          fontSize: 22, // Bigger title
          bold: true,
          alignment: "center", // Centered
          margin: [0, 0, 0, 20],
        },
        {
          text: "Fatura e fitimeve",
          style: "subheader",
          bold: true,
          fontSize: 16,
          margin: [0, 0, 0, 6],
        },
        {
          table: {
            headerRows: 1,
            widths: ["13%", "12%", "30%", "15%", "15%", "15%"],
            body: [
              // Header Row
              [
                { text: "Punëtori", bold: true },
                { text: "Tavolina", bold: true },
                { text: "Detajet", bold: true },
                { text: "Çmimi total", bold: true },
                { text: "Koha e krijimit", bold: true },
                { text: "Koha e pagesës", bold: true },
              ],
              // Data Rows - map through the invoices
              ...reportData.invoices.map((invoice) => [
                invoice.username,
                invoice.table,
                {
                  ul: invoice.products.map(
                    (product) => `${product.quantity} x ${product.product.name}`
                  ), // Map products
                },
                invoice.totalPrice + " Den",
                dayjs(invoice.createdAt).format("DD/MM/YYYY") +
                  "\n" +
                  new Date(invoice?.createdAt ?? "")?.toLocaleTimeString(
                    "en-GB",
                    { hour: "2-digit", minute: "2-digit" }
                  ),
                dayjs(invoice.paidAt).format("DD/MM/YYYY") +
                  "\n" +
                  new Date(invoice?.paidAt ?? "")?.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              ]),
            ],
          },
        },
        {
          text: "Harxhimet e punëtorëve",
          style: "subheader",
          bold: true,
          fontSize: 16,
          margin: [0, 50, 0, 6],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"], // Customize width of columns
            body: [
              // Header Row
              [
                { text: "Punëtori", bold: true },
                { text: "Tipi", bold: true },
                { text: "Çmimi", bold: true },
                { text: "Koha", bold: true },
                { text: "Arsyeja", bold: true },
              ],

              // Data Rows - map through the user expenses
              ...reportData.userExpenses.map((expense) => [
                expense.username,
                expense.type,
                expense.price + " Den",
                expense.date,
                expense.description,
              ]),
            ],
          },
        }, ////////////////////////////////////////////////
        {
          text: "Numërimi i mallit",
          style: "subheader",
          bold: true,
          fontSize: 16,
          margin: [0, 50, 0, 6],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"], // Customize width of columns
            body: [
              // Header Row
              [
                { text: "Produkti", bold: true },
                { text: "Malli në sistem", bold: true },
                { text: "Malli në dyqan", bold: true },
                { text: "Diferenca", bold: true },
                { text: "Fitimi / Humbja", bold: true },
              ],

              // Data Rows - map through the user expenses
              ...reportData.stockCount.map((expense) => [
                expense[0],
                expense[1],
                expense[2],
                Number(expense[3]) > 0 ? "+" + expense[3] : expense[3],
                expense[4],
              ]),
            ],
          },
        },
        {
          text: "Statistikat",
          style: "subheader",
          bold: true,
          fontSize: 16,
          margin: [0, 50, 0, 6],
        },
        {
          text: `Fitimi nga shitja: ${reportData.invoices.reduce((item, b) => item + b.totalPrice, 0)} Den`,
          bold: true,
          margin: [0, 5, 0, 5],
        },
        {
          text: `Harxhimet e punëtorit: ${-reportData.userExpenses.reduce((item, b) => item + b.price, 0)} Den`,
          bold: true,
          margin: [0, 5, 0, 5],
        },
        {
          text: `Fitimi/Humbja nga numërimi: ${reportData.stockCount.reduce((item, b) => item + Number(b[4]), 0)} Den`,
          bold: true,
          margin: [0, 5, 0, 5],
        },
        {
          canvas: [
            { type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 },
          ],
        },
        {
          text:
            "Fitimi total: " +
            (reportData.invoices.reduce((sum, b) => sum + b.totalPrice, 0) -
              reportData.userExpenses.reduce((sum, b) => sum + b.price, 0) +
              reportData.stockCount.reduce((sum, b) => sum + Number(b[4]), 0)) +
            " Den",
          style: "header",
          fontSize: 18, // Bigger title
          bold: true,
          margin: [0, 50, 0, 6],
        },
      ],
    };

    const pdfDoc = pdfmake.createPdf(docDefinition);
    return pdfDoc;
  }

  // Save PDF and return the file path
  async generateAndSaveReport(
    stockCheckData: StockCheckDto[],
    companyId: string
  ): Promise<Report> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const reportData = await this.generateMonthlyReport(
      stockCheckData,
      companyId
    );
    const pdfDoc = await this.generatePdf(reportData);

    const dirPath = path.join(__dirname, "reports");
    const filePath = path.join(
      dirPath,
      `monthly_report_${dayjs().format("DD_MM_YYYY")}.pdf`
    );

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Wrap getBuffer in a Promise
    const buffer: Buffer = await new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buf) => {
        if (!buf) return reject(new Error("Failed to generate PDF buffer"));
        resolve(buf);
      });
    });

    fs.writeFileSync(filePath, buffer);

    const report = this.reportRepository.create({
      reportName: "Raporti i " + dayjs().format("DD/MM/YYYY"),
      filePath: `monthly_report_${dayjs().format("DD_MM_YYYY")}.pdf`,
      invoicesTotalPrice: reportData.invoices.reduce(
        (sum, b) => sum + b.totalPrice,
        0
      ),
      expensesTotalPrice: reportData.userExpenses.reduce(
        (sum, b) => sum + b.price,
        0
      ),
      productDifferencesTotalPrice: reportData.stockCount.reduce(
        (sum, b) => sum + Number(b[4]),
        0
      ),
      createdAt: new Date(),
      isFinished: false,
      productsWithStocks: stockCheckData.map((item) => ({
        productId: item.product.productId,
        stock: item.quantity,
      })),
      company,
    });

    await this.reportRepository.save(report);

    return report;
  }

  async getAllReports(companyId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: {
        company: {
          id: companyId,
        },
      },
    });
  }

  async findById(id: string, companyId: string): Promise<Report | null> {
    // Find the report by its ID
    return this.reportRepository.findOne({
      where: { id, company: { id: companyId } },
    });
  }

  async cleanUpTables(companyId: string): Promise<void> {
    try {
      // Delete user expenses belonging to this company
      await this.userExpenseRepository
        .createQueryBuilder()
        .delete()
        .where("companyId = :companyId", { companyId })
        .execute();

      // Delete table_products for tables that belong to this company
      await this.tableProductRepository.query(
        `
      DELETE FROM table_products
      WHERE "tableId" IN (
        SELECT id FROM tables WHERE "companyId" = $1
      )
    `,
        [companyId]
      );

      // Delete tables for this company
      await this.invoiceRepository.query(
        `
      DELETE FROM tables WHERE "companyId" = $1
    `,
        [companyId]
      );

      console.log("Company-specific tables cleared successfully");
    } catch (error) {
      console.error("Error cleaning up tables for company:", error);
      throw new Error("Failed to clean up tables for this company");
    }
  }

  async updateProductStocksAndFinishReport(
    reportId: string,
    companyId: string
  ): Promise<any> {
    // Step 1: Fetch the report by ID
    const report = await this.findById(reportId, companyId);

    if (!report) {
      throw new Error("Report not found");
    }

    if (!report.productsWithStocks || report.isFinished) {
      throw new Error("Report already processed or missing stock data");
    }

    // Step 2: Update the product quantity in the product_stock table
    for (const productWithStock of report.productsWithStocks) {
      const { productId, stock } = productWithStock;

      // Check if the ProductStock entry exists by productId
      let productStock = await this.productStockRepository.findOne({
        where: { productId, companyId },
      });

      // If productStock does not exist, create a new entry with quantity = 0
      if (!productStock) {
        productStock = this.productStockRepository.create({
          productId,
          quantity: 0, // Default to 0 if not found
          companyId,
        });
      }

      // Update the quantity with the new stock value
      productStock.quantity = stock;

      // Save the updated (or new) productStock entry
      await this.productStockRepository.save(productStock);
    }

    // Step 3: Mark the report as finished
    report.isFinished = true;
    await this.reportRepository.save(report); // Save the updated report

    // Step 4: Return success message and the updated products

    await this.cleanUpTables(companyId);

    return {
      message: "Product quantities updated and report marked as finished",
    };
  }

  async deleteReport(reportId: string, companyId: string): Promise<void> {
    try {
      // Find the report by ID
      const report = await this.reportRepository.findOne({
        where: {
          id: reportId,
          company: { id: companyId },
        },
      });

      if (!report) {
        throw new Error("Report not found");
      }

      // Delete the report
      await this.reportRepository.delete(reportId);

      console.log("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      throw new Error("Failed to delete report");
    }
  }
}
