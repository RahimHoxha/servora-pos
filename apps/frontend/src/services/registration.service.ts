import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import {
  IGenerateRegistrationPayload,
  IRegistration,
} from "../types/registration";

export const getRegistrations = async (
  companyId: string
): Promise<IResponse<IRegistration[]>> => {
  return await axiosConfig.get(`/report?companyId=${companyId}`);
};

export const getReportPdf = async (reportId: string, companyId: string) => {
  return await axiosConfig.get(`report/${reportId}/pdf?companyId=${companyId}`);
};

export const finishRegistration = async (
  reportId: string,
  companyId: string
): Promise<IResponse<IRegistration[]>> => {
  return await axiosConfig.post(
    `/report/${reportId}/update-stock?companyId=${companyId}`
  );
};

export const deleteRegistration = async (
  reportId: string,
  companyId: string
) => {
  return await axiosConfig.delete(`/report/${reportId}?companyId=${companyId}`);
};

export const createRegistration = async (
  payload: IGenerateRegistrationPayload,
  companyId: string
): Promise<IResponse<IRegistration>> => {
  return await axiosConfig.post(
    `/report/generate?companyId=${companyId}`,
    payload
  );
};
