import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ProductCategoryService } from "./product-category.service";
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "./product-category.dto";
import { ProductCategory } from "./product-category.entity";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("product-categories")
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  createCategory(
    @Body() createDto: CreateProductCategoryDto
  ): Promise<ProductCategory> {
    return this.categoryService.createCategory(createDto);
  }

  @Get("company/:companyId")
  findAllCategories(
    @Param("companyId") companyId: string
  ): Promise<ProductCategory[]> {
    return this.categoryService.findAll(companyId);
  }

  @Get(":id/company/:companyId")
  findCategoryById(
    @Param("id") id: string,
    @Param("companyId") companyId: string
  ): Promise<ProductCategory> {
    return this.categoryService.findById(id, companyId);
  }

  @Put(":id/company/:companyId")
  @UseGuards(AuthGuard)
  updateCategory(
    @Param("id") id: string,
    @Param("companyId") companyId: string,
    @Body() updateDto: UpdateProductCategoryDto
  ): Promise<ProductCategory> {
    return this.categoryService.updateCategory(id, companyId, updateDto);
  }

  @Delete(":id/company/:companyId")
  @UseGuards(AuthGuard)
  deleteCategory(
    @Param("id") id: string,
    @Param("companyId") companyId: string
  ): Promise<void> {
    return this.categoryService.deleteCategory(id, companyId);
  }
}
