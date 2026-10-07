import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
};

interface FailedRequestPromise {
  resolve: () => void;
  reject: (error: unknown) => void;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedRequestPromise[] = [];
let onLogout: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void): void => {
  onLogout = handler;
};

const processQueue = (error: unknown = null): void => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  failedQueue = [];
};
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthCheck = originalRequest.url?.includes("/auth/me");
    const isLoginEndpoint =
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/accept-invite");
    const isOtpVerificationEndpoint =
      originalRequest.url?.includes("/auth/verify-otp") ||
      originalRequest.url?.includes("/auth/verify-reset-otp");
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isOtpVerificationEndpoint) {
        return Promise.reject(error);
      }

      if ((isAuthCheck || isLoginEndpoint) && !isRefreshing) {
        return Promise.reject(error);
      }

      if (isRefreshEndpoint) {
        if (onLogout) onLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
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