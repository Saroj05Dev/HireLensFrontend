import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import { connectSocket, disconnectSocket } from "../../helpers/socket";
import { loginApi, logoutApi, signupApi } from "./auth.api";
import { acceptInviteApi } from "../team/team.api";

// FetchMe
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data.data;
    } catch (error) {
      // Silently fail if user is not authenticated (expected on initial load)
      if (error.response?.status === 401) {
        return rejectWithValue(null);
      }
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

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      // Even if the API call fails, we still want to clear local state
    } finally {
      disconnectSocket();
    }
  }
);

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
    updateUser: (state, action) => {
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

export const { updateUser } = authSlice.actions;
export { logout };
export default authSlice.reducer;
