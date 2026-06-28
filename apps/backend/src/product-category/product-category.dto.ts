export class CreateProductCategoryDto {
  name: string;
  companyId: string; // ⬅️ Add companyId
}

export class UpdateProductCategoryDto {
  name?: string;
}
