import { ITables } from "../types/tables";

export const DEFAULT_TABLE_COUNT = 16;

export const createTableBoxes = (
  busyTables: ITables[],
  totalTables: number = DEFAULT_TABLE_COUNT
): ITables[] | null[] => {
  const tableBoxes = Array(totalTables).fill(null);

  busyTables.forEach((table) => {
    const index = table.tableNumber - 1;
    if (index >= 0 && index < totalTables) {
      tableBoxes[index] = table;
    }
  });

  return tableBoxes;
};