import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICreateUserExpsensePayload,
  IUserExpenseState,
} from "../types/user-expense";
import * as UserExpenseServices from "../services/user-expense.service";

const initialState: IUserExpenseState = {
  loading: false,
  allUserExpenses: [],
  singleUserExpenses: [],
  isAllExpensesFetched: false,
  isSingleUserExpensesFetched: false,
};

export const getAllUserExpenses = createAsyncThunk(
  "user-expense/get-all",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await UserExpenseServices.getAllUserExpenses(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSingleUserExpenses = createAsyncThunk(
  "user-expense/get-single-user",
  async (
    params: { userId: string; date: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await UserExpenseServices.getSingleUserExpenses(
        params.userId,
        params.date,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createUserExpense = createAsyncThunk(
  "user-expense/create",
  async (params: ICreateUserExpsensePayload, { rejectWithValue }) => {
    try {
      return await UserExpenseServices.createUserExpense(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteUserExpense = createAsyncThunk(
  "user-expense/delete",
  async (
    params: { expenseId: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await UserExpenseServices.deleteUserExpense(
        params.expenseId,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const userExpenseSlice = createSlice({
  name: "userExpense",
  initialState,
  reducers: {
    resetUserExpenses: (state) => {
      state.isSingleUserExpensesFetched = false;
      state.singleUserExpenses = [];
    },
    setResetExpenses: (state) => {
      state.allUserExpenses = [];
      state.singleUserExpenses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSingleUserExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleUserExpenses.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSingleUserExpenses.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleUserExpenses = payload.data;
        state.isSingleUserExpensesFetched = true;
      })
      .addCase(getAllUserExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUserExpenses.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAllUserExpenses.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allUserExpenses = payload.data;
        state.isAllExpensesFetched = true;
      })
      .addCase(createUserExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUserExpense.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createUserExpense.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleUserExpenses = [...state.singleUserExpenses, payload.data];
        state.allUserExpenses = [...state.allUserExpenses, payload.data];
      })
      .addCase(deleteUserExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserExpense.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteUserExpense.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.singleUserExpenses = state.singleUserExpenses.filter(
          (item) => item.id !== meta.arg.expenseId
        );
        state.allUserExpenses = state.allUserExpenses.filter(
          (item) => item.id !== meta.arg.expenseId
        );
      });
  },
});

export const { resetUserExpenses, setResetExpenses } = userExpenseSlice.actions;
export default userExpenseSlice.reducer;
