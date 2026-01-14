import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import { connectSocket, disconnectSocket } from "../../helpers/socket";

export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/auth/me");
            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong")
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState:{
        user: null,
        loading: true,
        isAuthenticated: false
    },
    reducers: {
        logout: (state) => {
            state.user = null,
            state.isAuthenticated = false,
            disconnectSocket();
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMe.pending, (state) => {
            state.loading = true
        })
        .addCase(fetchMe.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false

            connectSocket({
                userId: action.payload.id,
                organizationId: action.payload.organizationId
            });
        })
        .addCase(fetchMe.rejected, (state) => {
            state.loading = false,
            state.isAuthenticated = false,
            state.user = null
        })
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 