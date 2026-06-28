import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as RegistrationServices from "../services/registration.service";
import {
  IGenerateRegistrationPayload,
  IRegistrationState,
} from "../types/registration";

const initialState: IRegistrationState = {
  registrations: [],
  isRegistrationFetched: false,
  loading: false,
};

export const getRegistrations = createAsyncThunk(
  "registrations/get",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await RegistrationServices.getRegistrations(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getReportPdf = createAsyncThunk(
  "registrations/get-pdf",
  async (
    params: { reportId: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await RegistrationServices.getReportPdf(
        params.reportId,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const finishRegistration = createAsyncThunk(
  "registrations/finish",
  async (
    params: { reportId: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await RegistrationServices.finishRegistration(
        params.reportId,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteRegistration = createAsyncThunk(
  "registrations/delete",
  async (
    params: { reportId: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await RegistrationServices.deleteRegistration(
        params.reportId,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createRegistration = createAsyncThunk(
  "registrations/generate-registration",
  async (
    params: { payload: IGenerateRegistrationPayload; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await RegistrationServices.createRegistration(
        params.payload,
        params.companyId
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    refetchRegistrations: (state) => {
      state.isRegistrationFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRegistrations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRegistrations.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRegistrations.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.registrations = [...payload.data].reverse();
        state.isRegistrationFetched = true;
      })
      .addCase(finishRegistration.pending, (state) => {
        state.loading = true;
      })
      .addCase(finishRegistration.rejected, (state) => {
        state.loading = false;
      })
      .addCase(finishRegistration.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.registrations = state.registrations.map((item) =>
          item.id === meta.arg.reportId ? { ...item, isFinished: true } : item
        );
        state.isRegistrationFetched = false;
      })
      .addCase(deleteRegistration.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRegistration.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteRegistration.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.registrations = state.registrations.filter(
          (item) => item.id !== meta.arg.reportId
        );
      })
      .addCase(createRegistration.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRegistration.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createRegistration.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.registrations = [payload.data, ...state.registrations];
      });
  },
});

export const { refetchRegistrations } = registrationSlice.actions;
export default registrationSlice.reducer;
