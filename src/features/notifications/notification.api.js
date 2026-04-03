import axiosInstance from "../../helpers/axiosInstance";

export const fetchNotificationsApi = async ({ limit = 50, skip = 0, unreadOnly = false }) => {
    const response = await axiosInstance.get("/notifications", {
        params: { limit, skip, unreadOnly }
    });
    return response.data.data;
};

export const getUnreadCountApi = async () => {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data.data.count;
};

export const markAsReadApi = async (notificationId) => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
};

export const markAllAsReadApi = async () => {
    const response = await axiosInstance.patch("/notifications/read-all");
    return response.data.data;
};

export const deleteNotificationApi = async (notificationId) => {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data.data;
};

export const deleteAllNotificationsApi = async () => {
    const response = await axiosInstance.delete("/notifications");
    return response.data.data;
};
