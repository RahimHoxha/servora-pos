// Create Product DTO
export class CreateProductDto {
  name: string;
  image: string;
  product_categories: string[];
  price: number;
  companyId: string;
  availableFromTime?: string | null;
  availableUntilTime?: string | null;
}

export class UpdateProductDto {
  name?: string;
  image?: string;
  product_categories?: string[];
  price?: number;
  availableFromTime?: string | null;
  availableUntilTime?: string | null;
}
