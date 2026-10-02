import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

interface ConnectSocketParams {
  userId: string;
  organizationId: string;
}

export const connectSocket = ({ userId, organizationId }: ConnectSocketParams): void => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "");

  socket = io(socketUrl, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
    socket?.emit("join:user", userId);
    socket?.emit("join:organization", organizationId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error);
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Generic listener handler for flexibility with payload types
export const onCandidateStageUpdated = <T = unknown>(callback: (data: T) => void): void => {
  if (socket) {
    socket.on("candidate:stage-updated", callback);
  }
};

export const onDecisionCreated = <T = unknown>(callback: (data: T) => void): void => {
  if (socket) {
    socket.on("decision:created", callback);
  }
};

export const onInterviewAssigned = <T = unknown>(callback: (data: T) => void): void => {
  if (socket) {
    socket.on("interview:assigned", callback);
  }
};

export const onFeedbackSubmitted = <T = unknown>(callback: (data: T) => void): void => {
  if (socket) {
    socket.on("feedback:submitted", callback);
  }
};

export const onNotificationReceived = <T = unknown>(callback: (data: T) => void): void => {
  if (socket) {
    socket.on("notification:new", callback);
  }
};

export const offSocketEvent = (eventName: string): void => {
  if (socket) {
    socket.off(eventName);
  }
};