import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import {
  IProduct,
  IProductCategory,
  IProductCategoryPayload,
  IProductPayload,
  IUpdateProductPayload,
} from "../types/product";

export const createProduct = async (
  body: IProductPayload
): Promise<IResponse<IProduct>> => {
  return await axiosConfig.post("/products", body);
};

export const getProducts = async (
  companyId: string
): Promise<IResponse<IProduct[]>> => {
  return await axiosConfig.get(`/products?companyId=${companyId}`);
};

export const updateProduct = async (
  companyId: string,
  params: IUpdateProductPayload
): Promise<IResponse<IProduct>> => {
  return await axiosConfig.put(
    `/products/${params.id}?companyId=${companyId}`,
    params.body
  );
};

export const deleteProduct = async (id: string, companyId: string) => {
  return await axiosConfig.delete(`/products/${id}?companyId=${companyId}`);
};

export const createProductCategory = async (
  body: IProductCategoryPayload
): Promise<IResponse<IProductCategory>> => {
  return await axiosConfig.post("/product-categories", body);
};

export const getProductCategories = async (
  companyId: string
): Promise<IResponse<IProductCategory[]>> => {
  return await axiosConfig.get(`/product-categories/company/${companyId}`);
};
