import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITables, ITablesState, IUpsertTablePayload } from "../types/tables";
import * as TableServices from "../services/tables.service";

const initialState: ITablesState = {
  in_progress_tables: [],
  paid_tables: [],
  loading: false,
  isInProgressFetched: false,
  isPaidFetched: false,
  selectedTable: undefined,
};

export const getInProgressTables = createAsyncThunk(
  "tables/get-in-progress",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await TableServices.getInProgressTables(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getPaidTables = createAsyncThunk(
  "tables/get-paid",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await TableServices.getPaidTables(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createTable = createAsyncThunk(
  "tables/create",
  async (
    params: { body: IUpsertTablePayload["body"]; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await TableServices.createTable(params.body, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const editTable = createAsyncThunk(
  "tables/edit",
  async (
    params: { body: IUpsertTablePayload; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await TableServices.editTable(params.body, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteTable = createAsyncThunk(
  "tables/delete",
  async (params: { id: string; companyId: string }, { rejectWithValue }) => {
    try {
      return await TableServices.deleteTable(params.id, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const moveOrderToTable = createAsyncThunk(
  "tables/move-to-another-table",
  async (
    params: {
      companyId: string;
      fromTableNumber: number;
      toTableNumber: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await TableServices.moveOrderToTable(
        params.companyId,
        params.fromTableNumber,
        params.toTableNumber
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const payTable = createAsyncThunk(
  "tables/pay",
  async (params: { id: string; companyId: string }, { rejectWithValue }) => {
    try {
      return await TableServices.payTable(params.id, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    setSelectedTable: (state, action: PayloadAction<ITables | undefined>) => {
      state.selectedTable = action.payload;
    },
    setResetInvoices: (state) => {
      state.paid_tables = [];
    },
    setInProgressTables: (state, action: PayloadAction<ITables[]>) => {
      state.in_progress_tables = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInProgressTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInProgressTables.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getInProgressTables.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.in_progress_tables = payload.data;
        state.isInProgressFetched = true;
      })
      .addCase(getPaidTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaidTables.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getPaidTables.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.paid_tables = payload.data;
        state.isPaidFetched = true;
      })
      .addCase(createTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTable.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createTable.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedTable = payload.data;
      })
      .addCase(editTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(editTable.rejected, (state) => {
        state.loading = false;
      })
      .addCase(editTable.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.in_progress_tables = state.in_progress_tables.map((item) =>
          item.id === payload.data.id ? payload.data : item
        );
        state.selectedTable = payload.data;
      })
      .addCase(deleteTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTable.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteTable.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.in_progress_tables = state.in_progress_tables.filter(
          (item) => item.id !== meta.arg.id
        );
        state.selectedTable = undefined;
      })
      .addCase(payTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(payTable.rejected, (state) => {
        state.loading = false;
      })
      .addCase(payTable.fulfilled, (state, { payload, meta }) => {
        state.loading = false;
        state.in_progress_tables = state.in_progress_tables.filter(
          (item) => item.id !== meta.arg.id
        );
        state.paid_tables = [...state.paid_tables, payload.data];
      })
      .addCase(moveOrderToTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveOrderToTable.rejected, (state) => {
        state.loading = false;
      })
      .addCase(moveOrderToTable.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setSelectedTable, setResetInvoices, setInProgressTables } =
  tablesSlice.actions;
export default tablesSlice.reducer;
