import { IProduct } from "./product"
import { IUser } from "./user"

export enum EOrderStatus {
    PAID = 'PAID',
    IN_PROGRESS = 'IN_PROGRESS'
}

export interface ITablesState {
    in_progress_tables: ITables[],
    paid_tables: ITables[],
    loading: boolean,
    isInProgressFetched: boolean,
    isPaidFetched: boolean,
    selectedTable?: ITables;
}

export interface IUpsertTablePayload {
    id: string;
    body: {
        tableNumber: number,
        userId: string,
        products: { productId: string, quantity: number }[],
        status: "IN_PROGRESS"
    }
}

export interface ITables {
    id: string,
    tableNumber: number,
    status: EOrderStatus,
    sumTotal: number,
    acceptedAt: Date | null,
    paidAt: Date | null,
    products: {
        id: string,
        quantity: number,
        product: IProduct,
    }[],
    user: IUser
}