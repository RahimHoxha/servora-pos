export interface IUser {
    id: string;
    username: string;
    deletedAt: string;
}



export interface ICreateUserBody {
    username: string;
    password: string;
    confirm_password: string;
    companyId: string;
}