import axiosInstance from "../../helpers/axiosInstance";

export const sendOTPApi = async (payload) => {
    return axiosInstance.post("/auth/send-otp", payload);
};

export const verifyOTPApi = async (payload) => {
    return axiosInstance.post("/auth/verify-otp", payload);
};

export const signupApi = async (payload) => {
    return axiosInstance.post("/auth/register", payload);
};

export const loginApi = async (payload) => {
    return axiosInstance.post("/auth/login", payload);
};

export const logoutApi = async () => {
    return axiosInstance.post("/auth/logout");
};