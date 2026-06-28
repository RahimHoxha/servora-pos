import { ICompany } from "./company";

export enum EAuthorized {
  UNAUTHORIZED = "UNAUTHORIZED",
  AUTHORIZED_WITH_EMAIL = "LOGGED_IN_WITH_EMAIL",
  AUTHORIZED_WITH_CODE = "LOGGED_IN_WITH_CODE",
}

export interface ILoginPayloadWithEmail {
  email: string;
  password: string;
}

export interface ILoginPayloadWithCode {
  code: string;
}

export interface ILoginWithEmailResponse {
  company: ICompany;
  accessToken: string;
}

export interface ILoginState {
  authorized: EAuthorized;
  loading: boolean;
}
