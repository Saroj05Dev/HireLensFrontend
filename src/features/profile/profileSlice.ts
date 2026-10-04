import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import * as profileAPI from "./profile.api";
import { login } from "../auth/authSlice";
import type {
  UserProfile,
  ProfileState,
  UpdateProfilePayload,
  UploadAvatarResponse,
} from "../../types/profile.types";
import type { User } from "../../types/auth.types";

interface ApiErrorResponse {
  message?: string;
}

export const fetchProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await profileAPI.getProfile();
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch profile"
    );
  }
});

export const updateProfile = createAsyncThunk<
  UserProfile,
  UpdateProfilePayload,
  { rejectValue: string }
>("profile/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const response = await profileAPI.updateProfile(data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update profile"
    );
  }
});

export const uploadAvatar = createAsyncThunk<
  UploadAvatarResponse,
  File,
  { rejectValue: string }
>("profile/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const response = await profileAPI.uploadAvatar(file);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to upload avatar"
    );
  }
});

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  uploadingAvatar: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProfileFromUser: (state, action: PayloadAction<User>) => {
      // Initialize profile from user data after login
      const user = action.payload;
      state.profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        avatarUrl: user.avatarUrl || user.avatar,
        title: undefined, // Title is not available in auth user data
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch profile";
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update profile";
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(
        uploadAvatar.fulfilled,
        (state, action: PayloadAction<UploadAvatarResponse>) => {
          state.uploadingAvatar = false;
          if (state.profile) {
            state.profile.avatarUrl = action.payload.avatarUrl;
          }
        }
      )
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload ?? "Failed to upload avatar";
      })
      // Listen to login success to initialize profile
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        state.profile = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organizationName,
          avatarUrl: user.avatarUrl || user.avatar,
          title: undefined, // Title will be fetched separately
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });
  },
});

export const { clearError, setProfileFromUser } = profileSlice.actions;
export default profileSlice.reducer;