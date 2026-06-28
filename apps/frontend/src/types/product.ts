export interface IProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  availableFromTime?: string | null;
  availableUntilTime?: string | null;
  product_categories?: IProductCategory[];
}

export interface IProductPayload {
  name: string;
  image: string;
  price: number;
  product_categories?: string[];
  companyId: string;
  availableFromTime?: string | null;
  availableUntilTime?: string | null;
}

export interface IUpdateProductPayload {
  id: string;
  body: IProductPayload;
}

export interface IProductState {
  loading: boolean;
  products: IProduct[];
  isProductsFetched: boolean;
  selectedProduct?: IProduct;
  product_categories: IProductCategory[];
  isProductCategoriesFetched: boolean;
  selectedProductCategory?: IProductCategory;
}

export interface IProductCategory {
  id: string;
  name: string;
}

export interface IProductCategoryPayload {
  name: string;
  companyId: string;
}
