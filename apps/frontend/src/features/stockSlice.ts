import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProductStockPayload, IProductStockState } from "../types/stock";
import * as ProductStockService from "../services/stock.service";
import { IProduct } from "../types/product";

const initialState: IProductStockState = {
  isStockFetched: false,
  loading: false,
  products_stock: [],
  selectedProduct: undefined,
};

export const getAllStocks = createAsyncThunk(
  "product-stock/get-all",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await ProductStockService.getAllStocks(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addProductStock = createAsyncThunk(
  "product-stock/add",
  async (params: IProductStockPayload, { rejectWithValue }) => {
    try {
      return await ProductStockService.addProductStock(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const reduceProductStock = createAsyncThunk(
  "product-stock/reduce",
  async (params: IProductStockPayload, { rejectWithValue }) => {
    try {
      return await ProductStockService.reduceProductStock(
        params.companyId,
        params.productId,
        params.quantity
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    setSelectedProduct: (
      state,
      action: PayloadAction<IProduct | undefined>
    ) => {
      state.selectedProduct = action.payload;
    },
    refetchStocks: (state) => {
      state.isStockFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllStocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllStocks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAllStocks.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products_stock = payload.data;
        state.isStockFetched = true;
      })
      .addCase(addProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProductStock.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addProductStock.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products_stock = [
          ...state.products_stock.filter((item) => item.id !== payload.data.id),
          payload.data,
        ];
      })
      .addCase(reduceProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(reduceProductStock.rejected, (state) => {
        state.loading = false;
      })
      .addCase(reduceProductStock.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products_stock = [
          ...state.products_stock.filter((item) => item.id !== payload.data.id),
          payload.data,
        ];
      });
  },
});

export const { setSelectedProduct, refetchStocks } = stockSlice.actions;
export default stockSlice.reducer;
