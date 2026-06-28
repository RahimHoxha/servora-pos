export interface IRegistrationState {
    registrations: IRegistration[];
    isRegistrationFetched: boolean;
    loading: boolean;
}

export interface IRegistration {
    id: string;
    reportName: string,
    filePath: string,
    invoicesTotalPrice: number,
    expensesTotalPrice: number,
    productDifferencesTotalPrice: number,
    isFinished: boolean;
    createdAt: Date;
}

export interface IGenerateRegistrationPayload {
    product: {
        productId: string,
        name: string,
        image: string,
        price: number
    },
    quantity: number
}[]