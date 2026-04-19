import axiosInstance from "../../helpers/axiosInstance";

export const sendOTPApi = async (payload) => {
    return axiosInstance.post("/auth/send-otp", payload);
};

export const verifyOTPApi = async (payload) => {
    return axiosInstance.post("/auth/verify-otp", payload);
};

export const forgotPasswordApi = async (payload) => {
    return axiosInstance.post("/auth/forgot-password", payload);
};

export const verifyResetOTPApi = async (payload) => {
    return axiosInstance.post("/auth/verify-reset-otp", payload);
};

export const resetPasswordApi = async (payload) => {
    return axiosInstance.post("/auth/reset-password", payload);
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