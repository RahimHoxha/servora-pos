import { IProduct } from "./product";

export interface IProductStockPayload {
  companyId: string;
  productId: string;
  quantity: number;
}

export interface IProductStock {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProductStockState {
  isStockFetched: boolean;
  products_stock: IProductStock[];
  selectedProduct?: IProduct;
  loading: boolean;
}
