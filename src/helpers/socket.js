import { io } from "socket.io-client";

let socket = null;

export const connectSocket = ({ userId, organizationId }) => {
  socket = io(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    socket.emit("join", { userId, organizationId });
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

export const offSocketEvent = (eventName) => {
  if (socket) {
    socket.off(eventName);
  }
};
