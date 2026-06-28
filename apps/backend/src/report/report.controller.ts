// src/reports/report.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { ReportService } from "./report.service";
import { Report } from "./report.entity";
import { Response } from "express";

export interface StockCheckDto {
  product: {
    productId: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post("generate")
  async generateReport(
    @Query("companyId") companyId: string,
    @Body() stockCheckData: StockCheckDto[]
  ): Promise<Report> {
    const report = await this.reportService.generateAndSaveReport(
      stockCheckData,
      companyId
    );
    return report;
  }

  @Get()
  async getAllReports(
    @Query("companyId") companyId: string
  ): Promise<Report[]> {
    return this.reportService.getAllReports(companyId);
  }

  @Get(":id/pdf")
  async getReportPdf(
    @Param("id") id: string,
    @Query("companyId") companyId: string,
    @Res() res: Response
  ) {
    try {
      const report = await this.reportService.findById(id, companyId);
      if (!report || !report.filePath) {
        return res.status(404).send("Report not found or file path is missing");
      }

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${report.filePath.split("/").pop()}"`,
      });

      res.sendFile(report.filePath);
    } catch {
      res.status(500).send("Error fetching report");
    }
  }

  @Post(":id/update-stock")
  async updateProductStock(
    @Param("id") reportId: string,
    @Query("companyId") companyId: string,
    @Res() res: Response
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result =
        await this.reportService.updateProductStocksAndFinishReport(
          reportId,
          companyId
        );
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Error updating product quantities:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send("Failed to update product quantities");
    }
  }

  @Delete(":id")
  async deleteReport(
    @Param("id") reportId: string,
    @Query("companyId") companyId: string
  ): Promise<void> {
    await this.reportService.deleteReport(reportId, companyId);
  }
}
