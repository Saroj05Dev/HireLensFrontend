import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../helpers/axiosInstance";
import { connectSocket, disconnectSocket } from "../../helpers/socket";
import { loginApi, logoutApi, signupApi } from "./auth.api";
import { acceptInviteApi } from "../team/team.api";
import type {
  AuthState,
  User,
  LoginPayload,
  SignupPayload,
  AcceptInvitePayload,
} from "../../types/auth.types";

interface ApiErrorResponse {
  message?: string;
}

// FetchMe
export const fetchMe = createAsyncThunk<User, void, { rejectValue: string | null }>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get<{ data: User }>("/auth/me");
      return res.data.data;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      // Silently fail if user is not authenticated (expected on initial load)
      if (err.response?.status === 401) {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Signup
export const signup = createAsyncThunk<boolean, SignupPayload, { rejectValue: string }>(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      await signupApi(formData);
      return true;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message ||
        (error instanceof Error ? error.message : "Something went wrong")
      );
    }
  }
);

// Login
export const login = createAsyncThunk<boolean, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      await loginApi(formData);
      return true;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message ||
        (error instanceof Error ? error.message : "Something went wrong")
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk<void, void>(
  "auth/logout",
  async () => {
    try {
      await logoutApi();
    } catch {
      // Even if API call fails, clear local state
    } finally {
      disconnectSocket();
    }
  }
);

// Accept Invite
export const acceptInvite = createAsyncThunk<
  unknown,
  AcceptInvitePayload,
  { rejectValue: string }
>(
  "auth/acceptInvite",
  async ({ token, name, password }, { rejectWithValue }) => {
    try {
      const res = await acceptInviteApi({ token, name, password });
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;

        connectSocket({
          userId: action.payload.id,
          organizationId: action.payload.organizationId,
        });
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      /* logout */
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      /* signup & login */
      .addCase(signup.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(login.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(acceptInvite.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(login.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(acceptInvite.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? "Signup failed";
      })
      .addCase(login.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? "Login failed";
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? "Accept invite failed";
      });
  },
});

export const { updateUser } = authSlice.actions;
export default authSlice.reducer;