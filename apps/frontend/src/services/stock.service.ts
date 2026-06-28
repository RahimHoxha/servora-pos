import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import { IProductStock, IProductStockPayload } from "../types/stock";

export const getAllStocks = async (
  companyId: string
): Promise<IResponse<IProductStock[]>> => {
  return await axiosConfig.post("/product-stock/all", { companyId });
};

export const addProductStock = async (
  body: IProductStockPayload
): Promise<IResponse<IProductStock>> => {
  return await axiosConfig.post("/product-stock/add", body);
};

export const reduceProductStock = async (
  companyId: string,
  productId: string,
  quantity: number
): Promise<IResponse<IProductStock>> => {
  return await axiosConfig.put(`product-stock/reduce/${productId}`, {
    companyId,
    quantity,
  });
};
