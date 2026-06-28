import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductCategory } from "./product-category.entity";
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./product-category.dto";
import { Company } from "src/company/company.entity"; // ⬅️ import Company

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>
  ) {}

  // Create a new category
  async createCategory(
    createDto: CreateProductCategoryDto
  ): Promise<ProductCategory> {
    const category = this.categoryRepository.create({
      name: createDto.name,
      company: { id: createDto.companyId } as Company, // ⬅️ set company relation
    });
    return this.categoryRepository.save(category);
  }

  // Retrieve all categories by company
  async findAll(companyId: string): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { company: { id: companyId } },
    });
  }

  // Retrieve a category by ID and company
  async findById(id: string, companyId: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  // Update an existing category
  async updateCategory(
    id: string,
    companyId: string,
    updateDto: UpdateProductCategoryDto
  ): Promise<ProductCategory> {
    const category = await this.findById(id, companyId);
    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  // Delete a category
  async deleteCategory(id: string, companyId: string): Promise<void> {
    await this.findById(id, companyId);
    await this.categoryRepository.softDelete(id);
  }
}
