import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as LoginServices from "../services/login.service";
import { ILoginWithEmailPayload } from "../types/company";
import { EAuthorized, ILoginState } from "../types/login";
import { cacheVenueBranding } from "../brand/brand";

const initialState: ILoginState = {
  loading: false,
  authorized: EAuthorized.UNAUTHORIZED,
};

export const login = createAsyncThunk(
  "login/email",
  async (params: ILoginWithEmailPayload, { rejectWithValue }) => {
    try {
      return await LoginServices.login(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithCode = createAsyncThunk(
  "login/code",
  async (code: { code: string }, { rejectWithValue }) => {
    try {
      return await LoginServices.loginWithCode(code);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setAuthorizeState: (state, { payload }: PayloadAction<EAuthorized>) => {
      state.authorized = payload;
    },
    onLogout: (state) => {
      localStorage.removeItem("company_code");
      localStorage.removeItem("access_token");
      state.authorized = EAuthorized.UNAUTHORIZED;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.authorized = EAuthorized.UNAUTHORIZED;
        localStorage.removeItem("access_token");
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.authorized = EAuthorized.AUTHORIZED_WITH_EMAIL;
        localStorage.removeItem("company_code");
        localStorage.setItem("access_token", payload.data.accessToken);
        cacheVenueBranding(payload.data.company.name, payload.data.company.logo);
      })
      .addCase(loginWithCode.pending, () => {})
      .addCase(loginWithCode.rejected, (state) => {
        state.authorized = EAuthorized.UNAUTHORIZED;
        localStorage.removeItem("company_code");
      })
      .addCase(loginWithCode.fulfilled, (state, { meta }) => {
        state.authorized = EAuthorized.AUTHORIZED_WITH_CODE;
        localStorage.removeItem("access_token");
        localStorage.setItem("company_code", meta.arg.code);
      });
  },
});

export const { setAuthorizeState, onLogout } = loginSlice.actions;
export default loginSlice.reducer;
