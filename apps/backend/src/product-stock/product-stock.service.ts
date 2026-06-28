import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductStock } from "./product-stock.entity";

@Injectable()
export class ProductStockService {
  constructor(
    @InjectRepository(ProductStock)
    private readonly productStockRepository: Repository<ProductStock>
  ) {}

  async addStock(
    companyId: string,
    productId: string,
    quantity: number
  ): Promise<ProductStock> {
    let stock = await this.productStockRepository.findOne({
      where: { productId, companyId },
    });

    if (!stock) {
      stock = this.productStockRepository.create({
        companyId,
        productId,
        quantity,
      });
    } else {
      stock.quantity += quantity;
    }

    return this.productStockRepository.save(stock);
  }

  async editStock(
    companyId: string,
    productId: string,
    quantity: number
  ): Promise<ProductStock> {
    const stock = await this.productStockRepository.findOne({
      where: { productId, companyId },
    });

    if (!stock) {
      throw new NotFoundException("Stock not found for this product.");
    }

    stock.quantity = quantity;
    return this.productStockRepository.save(stock);
  }

  async deleteStock(companyId: string, productId: string): Promise<void> {
    const stock = await this.productStockRepository.findOne({
      where: { productId, companyId },
    });

    if (!stock) {
      throw new NotFoundException("Stock not found for this product.");
    }

    await this.productStockRepository.remove(stock);
  }

  async reduceStock(
    companyId: string,
    productId: string,
    quantity: number
  ): Promise<ProductStock> {
    const stock = await this.productStockRepository.findOne({
      where: { productId, companyId },
    });

    if (!stock) {
      throw new NotFoundException("Stock not found for this product.");
    }

    if (stock.quantity < quantity) {
      throw new Error("Insufficient stock.");
    }

    stock.quantity -= quantity;
    return this.productStockRepository.save(stock);
  }

  async getStock(companyId: string, productId: string): Promise<ProductStock> {
    const stock = await this.productStockRepository.findOne({
      where: { productId, companyId },
    });

    if (!stock) {
      throw new NotFoundException("Stock not found for this product.");
    }

    return stock;
  }

  async getAllStocks(companyId: string): Promise<ProductStock[]> {
    return this.productStockRepository.find({ where: { companyId } });
  }
}
