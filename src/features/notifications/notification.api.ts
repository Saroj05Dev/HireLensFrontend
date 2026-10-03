import axiosInstance from "../../helpers/axiosInstance";
import type {
  FetchNotificationsParams,
  FetchNotificationsResponse,
  NotificationItem,
} from "../../types/notification.types";

export const fetchNotificationsApi = async ({
  limit = 50,
  skip = 0,
  unreadOnly = false,
}: FetchNotificationsParams = {}): Promise<FetchNotificationsResponse> => {
  const response = await axiosInstance.get<{ data: FetchNotificationsResponse }>(
    "/notifications",
    {
      params: { limit, skip, unreadOnly },
    }
  );
  return response.data.data;
};

export const getUnreadCountApi = async (): Promise<number> => {
  const response = await axiosInstance.get<{ data: { count: number } }>(
    "/notifications/unread-count"
  );
  return response.data.data.count;
};

export const markAsReadApi = async (
  notificationId: string
): Promise<NotificationItem> => {
  const response = await axiosInstance.patch<{ data: NotificationItem }>(
    `/notifications/${notificationId}/read`
  );
  return response.data.data;
};

export const markAllAsReadApi = async (): Promise<any> => {
  const response = await axiosInstance.patch("/notifications/read-all");
  return response.data.data;
};

export const deleteNotificationApi = async (
  notificationId: string
): Promise<any> => {
  const response = await axiosInstance.delete(
    `/notifications/${notificationId}`
  );
  return response.data.data;
};

export const deleteAllNotificationsApi = async (): Promise<any> => {
  const response = await axiosInstance.delete("/notifications");
  return response.data.data;
};