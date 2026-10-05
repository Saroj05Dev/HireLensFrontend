import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import * as profileAPI from "./profile.api";
import { login, signup } from "../auth/authSlice";
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

// Shared helper — seeds profile state from auth user data (login or signup)
const profileFromUser = (user: User): UserProfile => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId,
  organizationName: user.organizationName,
  avatarUrl: user.avatarUrl || user.avatar,
  title: undefined, // title is only available from GET /profile
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
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
      // Seed profile immediately on login OR signup — no extra API call needed
      .addCase(login.fulfilled, (state, action) => {
        state.profile = profileFromUser(action.payload);
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.profile = profileFromUser(action.payload);
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;