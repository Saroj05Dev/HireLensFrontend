import axios from "axios";
import store from "../store/store";
import { logout } from "../features/auth/authSlice";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if(isRefreshing) {
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
            } catch (error) {
                processQueue(error);
                store.dispatch(logout);
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;