import { axiosConfig } from "../lib/axios";
import { IResponse } from "../types/common";
import {
  ILoginWithEmailResponse,
  ILoginPayloadWithEmail,
} from "../types/login";

export const login = async (
  body: ILoginPayloadWithEmail
): Promise<IResponse<ILoginWithEmailResponse>> => {
  return await axiosConfig.post("/auth/login", body);
};

export const loginWithCode = async (params: {
  code: string;
}): Promise<{ success: boolean }> => {
  return await axiosConfig.post("/auth/login-with-code", params);
};
