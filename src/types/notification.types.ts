export type NotificationType =
  | "STAGE_CHANGE"
  | "INTERVIEW_ASSIGNED"
  | "FEEDBACK_SUBMITTED"
  | "DECISION_LOG"
  | string;

export interface NotificationItem {
  id: string;
  userId?: string;
  title?: string;
  message: string;
  type?: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FetchNotificationsParams {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}

export interface FetchNotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total?: number;
}

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}