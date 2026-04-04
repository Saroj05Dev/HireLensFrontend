import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileAPI from './profile.api';

export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await profileAPI.getProfile();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await profileAPI.updateProfile(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file, { rejectWithValue }) => {
        try {
            const response = await profileAPI.uploadAvatar(file);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        profile: null,
        loading: false,
        error: null,
        uploadingAvatar: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.uploadingAvatar = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.uploadingAvatar = false;
                if (state.profile) {
                    state.profile.avatarUrl = action.payload.avatarUrl;
                }
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.uploadingAvatar = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
