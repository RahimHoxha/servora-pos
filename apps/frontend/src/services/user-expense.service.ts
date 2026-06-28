import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import {
  ICreateUserExpsensePayload,
  IUserExpense,
} from "../types/user-expense";

export const getAllUserExpenses = async (
  companyId: string
): Promise<IResponse<IUserExpense[]>> => {
  return await axiosConfig.get(`/user-expense?companyId=${companyId}`);
};

export const getSingleUserExpenses = async (
  userId: string,
  date: string,
  companyId: string
): Promise<IResponse<IUserExpense[]>> => {
  return await axiosConfig.get(
    `/user-expense/${userId}?companyId=${companyId}&date=${date}`
  );
};

export const createUserExpense = async (
  payload: ICreateUserExpsensePayload
): Promise<IResponse<IUserExpense>> => {
  return await axiosConfig.post(`/user-expense/create`, payload);
};

export const deleteUserExpense = async (
  expenseId: string,
  companyId: string
) => {
  return await axiosConfig.delete(
    `/user-expense/${expenseId}?companyId=${companyId}`
  );
};
