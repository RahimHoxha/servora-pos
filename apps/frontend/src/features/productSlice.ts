import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IProduct,
  IProductCategoryPayload,
  IProductPayload,
  IProductState,
  IUpdateProductPayload,
} from "../types/product";
import * as ProductServices from "../services/product.service";

const initialState: IProductState = {
  isProductsFetched: false,
  loading: false,
  products: [],
  selectedProduct: undefined,
  isProductCategoriesFetched: false,
  product_categories: [],
  selectedProductCategory: undefined,
};

export const createProduct = createAsyncThunk(
  "product/create",
  async (params: IProductPayload, { rejectWithValue }) => {
    try {
      return await ProductServices.createProduct(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getProducts = createAsyncThunk(
  "product/get",
  async (params: { companyId: string }, { rejectWithValue }) => {
    try {
      return await ProductServices.getProducts(params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async (
    params: { companyId: string; body: IUpdateProductPayload },
    { rejectWithValue }
  ) => {
    try {
      return await ProductServices.updateProduct(params.companyId, params.body);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (params: { id: string; companyId: string }, { rejectWithValue }) => {
    try {
      return await ProductServices.deleteProduct(params.id, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createProductCategory = createAsyncThunk(
  "product/create-category",
  async (params: IProductCategoryPayload, { rejectWithValue }) => {
    try {
      return await ProductServices.createProductCategory(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getProductCategories = createAsyncThunk(
  "product/get-product-categories",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await ProductServices.getProductCategories(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedProduct: (
      state,
      action: PayloadAction<IProduct | undefined>
    ) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = [...state.products, payload.data];
      })
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload.data;
        state.isProductsFetched = true;
      })
      .addCase(createProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProductCategory.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createProductCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.product_categories = [...state.product_categories, payload.data];
      })
      .addCase(getProductCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductCategories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getProductCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.product_categories = payload.data;
        state.isProductCategoriesFetched = true;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateProduct.fulfilled, (state, { payload, meta }) => {
        state.loading = false;
        state.products = state.products.map((item) =>
          item?.id === meta.arg.body.id ? payload.data : item
        );
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteProduct.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.products = state.products.filter(
          (item) => item.id !== meta.arg.id
        );
      });
  },
});

export const { setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
