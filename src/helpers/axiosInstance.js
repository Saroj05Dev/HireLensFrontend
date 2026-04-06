import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let onLogout = null;

export const setLogoutHandler = (handler) => {
  onLogout = handler;
};

const processQueue = (error) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve()
  );
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's the initial auth check (/auth/me) or refresh endpoint
    const isAuthCheck = originalRequest.url?.includes('/auth/me');
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If it's the initial auth check, just reject silently (user not logged in)
      if (isAuthCheck && !isRefreshing) {
        return Promise.reject(error);
      }

      // If refresh endpoint fails, user needs to login again
      if (isRefreshEndpoint) {
        if (onLogout) onLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);

        if (onLogout) onLogout();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
