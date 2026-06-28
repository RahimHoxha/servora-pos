import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as CompanyServices from "../services/company.service";
import {
  ICompany,
  ICompanyState,
  IUpdateCompanyInfoPayload,
} from "../types/company";
import { cacheVenueBranding } from "../brand/brand";

const initialState: ICompanyState = {
  loading: false,
  company: undefined,
  port: null,
};

export const getCompany = createAsyncThunk(
  "company/get",
  async (_, { rejectWithValue }) => {
    try {
      return await CompanyServices.getCompany();
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateCompany = createAsyncThunk(
  "company/update-company",
  async (
    params: {
      id: string;
      body: IUpdateCompanyInfoPayload;
    },
    { rejectWithValue }
  ) => {
    try {
      return await CompanyServices.updateCompany(params.id, params.body);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getCompanyByCode = createAsyncThunk(
  "company/get-by-code",
  async (code: string, { rejectWithValue }) => {
    try {
      return await CompanyServices.getCompanyByCode(code);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addTableSlot = createAsyncThunk(
  "company/add-table-slot",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await CompanyServices.addTableSlot(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const removeTableSlot = createAsyncThunk(
  "company/remove-table-slot",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await CompanyServices.removeTableSlot(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const uploadImage = createAsyncThunk(
  "company/upload-image",
  async (params: FormData, { rejectWithValue }) => {
    try {
      return await CompanyServices.uploadImage(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompany: (state, { payload }: PayloadAction<ICompany | undefined>) => {
      state.company = payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPort: (state, { payload }: PayloadAction<any>) => {
      state.port = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCompany.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCompany.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload.data;
        cacheVenueBranding(payload.data.name, payload.data.logo);
      })
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCompany.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateCompany.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload.data;
        cacheVenueBranding(payload.data.name, payload.data.logo);
      })
      .addCase(getCompanyByCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCompanyByCode.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCompanyByCode.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload.data;
        cacheVenueBranding(payload.data.name, payload.data.logo);
      })
      .addCase(addTableSlot.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload.data;
      })
      .addCase(removeTableSlot.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.company = payload.data;
      });
  },
});

export const { setCompany, setPort } = companySlice.actions;
export default companySlice.reducer;
