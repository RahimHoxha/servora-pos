import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import { ITables, IUpsertTablePayload } from "../types/tables";

export const getInProgressTables = async (
  companyId: string
): Promise<IResponse<ITables[]>> => {
  return await axiosConfig.get(
    `/tables?companyId=${companyId}&status=IN_PROGRESS`
  );
};

export const getPaidTables = async (
  companyId: string
): Promise<IResponse<ITables[]>> => {
  return await axiosConfig.get(`/tables?companyId=${companyId}&status=PAID`);
};

export const createTable = async (
  body: IUpsertTablePayload["body"],
  companyId: string
): Promise<IResponse<ITables>> => {
  return await axiosConfig.post(`/tables?companyId=${companyId}`, body);
};

export const editTable = async (
  params: IUpsertTablePayload,
  companyId: string
): Promise<IResponse<ITables>> => {
  return await axiosConfig.put(
    `/tables/${params.id}?companyId=${companyId}`,
    params.body
  );
};

export const deleteTable = async (id: string, companyId: string) => {
  return await axiosConfig.delete(`/tables/${id}?companyId=${companyId}`);
};

export const payTable = async (
  id: string,
  companyId: string
): Promise<IResponse<ITables>> => {
  return await axiosConfig.put(`/tables/${id}/pay?companyId=${companyId}`);
};

export const moveOrderToTable = async (
  companyId: string,
  fromTableNumber: number,
  toTableNumber: number
): Promise<IResponse<ITables>> => {
  return await axiosConfig.post(`/tables/move?companyId=${companyId}`, {
    fromTableNumber,
    toTableNumber,
  });
};
