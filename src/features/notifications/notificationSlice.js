import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    fetchNotificationsApi,
    getUnreadCountApi,
    markAsReadApi,
    markAllAsReadApi,
    deleteNotificationApi,
    deleteAllNotificationsApi
} from "./notification.api";

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async ({ limit = 50, skip = 0, unreadOnly = false }, { rejectWithValue }) => {
        try {
            const res = await fetchNotificationsApi({ limit, skip, unreadOnly });
            return res;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
        }
    }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
    "notifications/getUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const count = await getUnreadCountApi();
            return count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
        }
    }
);

// Mark as read
export const markAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            await markAsReadApi(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            await markAllAsReadApi();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    "notifications/deleteNotification",
    async (notificationId, { rejectWithValue }) => {
        try {
            await deleteNotificationApi(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete notification");
        }
    }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
    "notifications/deleteAllNotifications",
    async (_, { rejectWithValue }) => {
        try {
            await deleteAllNotificationsApi();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete all notifications");
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        // Real-time notification received
        notificationReceived: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get unread count
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })

            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })

            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
            })

            // Delete all notifications
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.notifications = [];
                state.unreadCount = 0;
            });
    },
});

export const { notificationReceived, clearError } = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationSlice.reducer;
