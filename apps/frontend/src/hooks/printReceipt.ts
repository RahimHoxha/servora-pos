import { ITables } from "../types/tables";

export const printReceipt = (order: ITables) => {
    console.log(order)
    return (window as any).electron.printReceipt(order); // Now using the exposed function from preload.ts
};
