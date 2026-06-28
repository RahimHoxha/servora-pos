import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import { ICreateUserBody, IUser } from "../types/user";

export const getCompanyUserByCode = async (
  companyId: string,
  userCode: string
): Promise<IResponse<IUser>> => {
  return await axiosConfig.get(`/users/company/${companyId}/code/${userCode}`);
};

export const createUser = async (
  body: ICreateUserBody
): Promise<IResponse<IUser>> => {
  return await axiosConfig.post("/users", body);
};

export const getUsers = async (
  companyId: string
): Promise<IResponse<IUser[]>> => {
  return await axiosConfig.get(`/users/company/${companyId}`);
};

export const changePassword = async (
  companyId: string,
  body: { userId: string; newPassword: string; confirmNewPassword: string }
) => {
  return await axiosConfig.patch(
    `/users/company/${companyId}/change-password`,
    body
  );
};
export const deleteUser = async (userId: string, companyId: string) => {
  return await axiosConfig.delete(`/users/${userId}/company/${companyId}`);
};
