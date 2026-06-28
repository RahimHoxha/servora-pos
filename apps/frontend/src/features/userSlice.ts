import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICreateUserBody, IUser } from "../types/user";
import * as UserServices from "../services/user.service";

interface UserState {
  loading: boolean;
  user?: IUser;
  isAuthorized: boolean;
  users: IUser[];
  isUsersFetched: boolean;
  selectedUser?: IUser;
}

const initialState: UserState = {
  loading: false,
  user: undefined,
  isAuthorized: false,
  users: [],
  isUsersFetched: false,
  selectedUser: undefined,
};

export const createUser = createAsyncThunk(
  "user/register",
  async (params: ICreateUserBody, { rejectWithValue }) => {
    try {
      return await UserServices.createUser(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getCompanyUserByCode = createAsyncThunk(
  "user/get-user-by-code",
  async (
    params: { companyId: string; userCode: string },
    { rejectWithValue }
  ) => {
    try {
      return await UserServices.getCompanyUserByCode(
        params.companyId,
        params.userCode
      );
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getUsers = createAsyncThunk(
  "user/get-all",
  async (companyId: string, { rejectWithValue }) => {
    try {
      return await UserServices.getUsers(companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (
    params: { userId: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      return await UserServices.deleteUser(params.userId, params.companyId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/change-password",
  async (
    payload: {
      companyId: string;
      body: { userId: string; newPassword: string; confirmNewPassword: string };
    },
    { rejectWithValue }
  ) => {
    try {
      return await UserServices.changePassword(payload.companyId, payload.body);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = undefined;
      state.isAuthorized = false;
      state.loading = false;
    },
    setSelectedUser: (state, action: PayloadAction<IUser | undefined>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = [...state.users, payload.data];
      })
      .addCase(getCompanyUserByCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCompanyUserByCode.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCompanyUserByCode.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedUser = payload.data;
      })
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = payload.data;
        state.isUsersFetched = true;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteUser.fulfilled, (state, { meta }) => {
        state.loading = false;
        state.users = state.users.filter((item) => item.id !== meta.arg.userId);
      });
  },
});

export const { setUser, logout, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
