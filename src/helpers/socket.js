import { io } from "socket.io-client";

let socket = null;

export const connectSocket = ({ userId, organizationId }) => {
  // Use dedicated socket URL (base URL without /api/v1 path)
  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');

  socket = io(socketUrl, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    // Join both user and organization rooms
    socket.emit("join:user", userId);
    socket.emit("join:organization", organizationId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onCandidateStageUpdated = (callback) => {
  if (socket) {
    socket.on("candidate:stage-updated", callback);
  }
};

export const onDecisionCreated = (callback) => {
  if (socket) {
    socket.on("decision:created", callback);
  }
};

export const onInterviewAssigned = (callback) => {
  if (socket) {
    socket.on("interview:assigned", callback);
  }
};

export const onFeedbackSubmitted = (callback) => {
  if (socket) {
    socket.on("feedback:submitted", callback);
  }
};

export const onNotificationReceived = (callback) => {
  if (socket) {
    socket.on("notification:new", callback);
  }
};

export const offSocketEvent = (eventName) => {
  if (socket) {
    socket.off(eventName);
  }
};
