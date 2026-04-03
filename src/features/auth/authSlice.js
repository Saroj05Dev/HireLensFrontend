import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import { connectSocket, disconnectSocket } from "../../helpers/socket";
import { loginApi, signupApi } from "./auth.api";
import { acceptInviteApi } from "../team/team.api";

// FetchMe
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Signup

export const signup = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      await signupApi(formData);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Login

export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      await loginApi(formData);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// Accept Invite

export const acceptInvite = createAsyncThunk(
  "auth/acceptInvite",
  async ({ token, name, password }, { rejectWithValue }) => {
    try {
      const res = await acceptInviteApi({ token, name, password });
      return res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    isAuthenticated: false,

    authLoading: false,
    authError: null,
  },
  reducers: {
    logout: (state) => {
      (state.user = null), (state.isAuthenticated = false), disconnectSocket();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;

        connectSocket({
          userId: action.payload.id,
          organizationId: action.payload.organizationId,
        });
      })
      .addCase(fetchMe.rejected, (state) => {
        (state.loading = false),
          (state.isAuthenticated = false),
          (state.user = null);
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
        state.authError = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload;
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
