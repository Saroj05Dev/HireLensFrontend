import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  fetchNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  deleteAllNotificationsApi,
} from "./notification.api";
import type { RootState } from "../../store/store";
import type {
  NotificationItem,
  NotificationState,
  FetchNotificationsParams,
  FetchNotificationsResponse,
} from "../../types/notification.types";

interface ApiErrorResponse {
  message?: string;
}

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
  FetchNotificationsResponse,
  FetchNotificationsParams | undefined,
  { rejectValue: string }
>(
  "notifications/fetchNotifications",
  async ({ limit = 50, skip = 0, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchNotificationsApi({ limit, skip, unreadOnly });
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/getUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const count = await getUnreadCountApi();
    return count;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch unread count"
    );
  }
});

// Mark as read
export const markAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/markAsRead", async (notificationId, { rejectWithValue }) => {
  try {
    await markAsReadApi(notificationId);
    return notificationId;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to mark as read"
    );
  }
});

// Mark all as read
export const markAllAsRead = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await markAllAsReadApi();
    return true;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to mark all as read"
    );
  }
});

// Delete notification
export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(notificationId);
      return notificationId;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>("notifications/deleteAllNotifications", async (_, { rejectWithValue }) => {
  try {
    await deleteAllNotificationsApi();
    return true;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete all notifications"
    );
  }
});

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Real-time notification received
    notificationReceived: (
      state,
      action: PayloadAction<NotificationItem>
    ) => {
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
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<FetchNotificationsResponse>) => {
          state.loading = false;
          state.notifications = action.payload.notifications;
          state.unreadCount = action.payload.unreadCount;
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch notifications";
      })

      // Get unread count
      .addCase(
        getUnreadCount.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.unreadCount = action.payload;
        }
      )

      // Mark as read
      .addCase(
        markAsRead.fulfilled,
        (state, action: PayloadAction<string>) => {
          const notification = state.notifications.find(
            (n) => n.id === action.payload
          );
          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      )

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(
        deleteNotification.fulfilled,
        (state, action: PayloadAction<string>) => {
          const notification = state.notifications.find(
            (n) => n.id === action.payload
          );
          if (notification && !notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications = state.notifications.filter(
            (n) => n.id !== action.payload
          );
        }
      )

      // Delete all notifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived, clearError } = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.loading;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;

export default notificationSlice.reducer;