import { IProduct } from "./product";
import { IUser } from "./user";

export enum IUserExpenseType {
  PRODUCT = "PRODUCT",
  CASH = "CASH",
}

export interface IUserExpense {
  id: string;
  type: IUserExpenseType;
  quantity: number;
  cashAmount: number;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  product: IProduct;
  description?: string;
}

export interface ICreateUserExpsensePayload {
  companyId: string;
  userId: string;
  type: IUserExpenseType;
  productId: string;
  quantity?: number;
  description?: string;
  cashAmount?: number;
}

export interface IUserExpenseState {
  loading: boolean;
  singleUserExpenses: IUserExpense[];
  allUserExpenses: IUserExpense[];
  isSingleUserExpensesFetched: boolean;
  isAllExpensesFetched: boolean;
}
