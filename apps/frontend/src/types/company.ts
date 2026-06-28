export interface ILoginWithEmailPayload {
  email: string;
  password: string;
}

export interface ICompanyState {
  loading: boolean;
  company?: ICompany;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  port: any;
}

export interface ICompany {
  id: string;
  name: string;
  address: string;
  phone: string;
  code: string;
  logo: string;
  tableCount?: number;
}

export interface IUpdateCompanyInfoPayload {
  name: string;
  address: string;
  phone: string;
  logo: string;
}
