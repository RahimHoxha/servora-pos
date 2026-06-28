import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import { ICompany, IUpdateCompanyInfoPayload } from "../types/company";

export const getCompany = async (): Promise<IResponse<ICompany>> => {
  return await axiosConfig.get("/companies/my-company");
};

export const updateCompany = async (
  id: string,
  payload: IUpdateCompanyInfoPayload
): Promise<IResponse<ICompany>> => {
  return await axiosConfig.post(`/companies/${id}`, payload);
};

export const getCompanyByCode = async (
  code: string
): Promise<IResponse<ICompany>> => {
  return await axiosConfig.get(`/companies/code/${code}`);
};

export const addTableSlot = async (
  companyId: string
): Promise<IResponse<ICompany>> => {
  return await axiosConfig.post(`/companies/${companyId}/tables/add`);
};

export const removeTableSlot = async (
  companyId: string
): Promise<IResponse<ICompany>> => {
  return await axiosConfig.delete(`/companies/${companyId}/tables/remove`);
};

export const changeAdminPassword = async (
  companyId: string,
  body: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
): Promise<IResponse<{ success: true }>> => {
  return await axiosConfig.patch(
    `/companies/${companyId}/admin-password`,
    body
  );
};

export const uploadImage = async (payload: FormData) => {
  return await axiosConfig.post(`/upload`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
