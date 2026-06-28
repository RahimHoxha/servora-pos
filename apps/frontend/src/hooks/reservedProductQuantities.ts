import { ITables } from "../types/tables";

export const reservedProductQuantities = (orders: ITables[]): Record<string, number> => {
    return orders.reduce<Record<string, number>>((acc, order) => {
        order.products.forEach(({ quantity, product }) => {
            if (!acc[product.id]) {
                acc[product.id] = 0;
            }
            acc[product.id] += quantity;
        });
        return acc;
    }, {});
};