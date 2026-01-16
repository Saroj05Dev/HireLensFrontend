import axiosInstance from "../../helpers/axiosInstance";

export const signupApi = async (payload) => {
    return axiosInstance.post("/auth/register", payload);
};

export const loginApi = async (payload) => {
    return axiosInstance.post("/auth/login", payload);
};