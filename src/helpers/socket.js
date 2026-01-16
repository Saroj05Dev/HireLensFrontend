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
