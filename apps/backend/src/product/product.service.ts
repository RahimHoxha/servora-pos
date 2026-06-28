import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Product } from "./product.entity";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { ProductCategory } from "../product-category/product-category.entity";
import { Company } from "../company/company.entity"; // <-- Import Company

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company> // <-- Add Company repo
  ) {}

  async createProduct(createDto: CreateProductDto): Promise<Product> {
    const { companyId, ...productData } = createDto;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const categories = createDto.product_categories
      ? await this.categoryRepository.findBy({
          id: In(createDto.product_categories),
        })
      : [];

    const product = this.productRepository.create({
      ...productData,
      product_categories: categories,
      company,
    });

    return this.productRepository.save(product);
  }

  async findAll(companyId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        company: { id: companyId },
      },
      relations: { product_categories: true },
    });
  }

  async findById(id: string, companyId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, company: { id: companyId } },
      relations: { product_categories: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found in this company`
      );
    }

    return product;
  }

  async updateProduct(
    id: string,
    companyId: string,
    updateDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.findById(id, companyId);

    if (updateDto.product_categories) {
      const categories = await this.categoryRepository.findBy({
        id: In(updateDto.product_categories),
      });
      product.product_categories = categories;
    }

    if (updateDto.name !== undefined) product.name = updateDto.name;
    if (updateDto.image !== undefined) product.image = updateDto.image;
    if (updateDto.price !== undefined) product.price = updateDto.price;
    if (updateDto.availableFromTime !== undefined) {
      product.availableFromTime = updateDto.availableFromTime;
    }
    if (updateDto.availableUntilTime !== undefined) {
      product.availableUntilTime = updateDto.availableUntilTime;
    }

    return this.productRepository.save(product);
  }

  async deleteProduct(id: string, companyId: string): Promise<void> {
    await this.findById(id, companyId);
    await this.productRepository.softDelete(id);
  }

  async restoreProduct(id: string, companyId: string): Promise<void> {
    const product = await this.findById(id, companyId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found in this company`
      );
    }
    await this.productRepository.restore(id);
  }
}
