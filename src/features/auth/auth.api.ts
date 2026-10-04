import { AxiosResponse } from "axios";
import axiosInstance from "../../helpers/axiosInstance";
import type {
  SendOtpPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  VerifyResetOtpPayload,
  ResetPasswordPayload,
  SignupPayload,
  LoginPayload,
  User,
} from "../../types/auth.types";

export const sendOTPApi = async (payload: SendOtpPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/send-otp", payload);
};

export const verifyOTPApi = async (payload: VerifyOtpPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/verify-otp", payload);
};

export const forgotPasswordApi = async (payload: ForgotPasswordPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/forgot-password", payload);
};

export const verifyResetOTPApi = async (payload: VerifyResetOtpPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/verify-reset-otp", payload);
};

export const resetPasswordApi = async (payload: ResetPasswordPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/reset-password", payload);
};

export const signupApi = async (payload: SignupPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/register", payload);
};

export const loginApi = async (payload: LoginPayload) => {
  const response = await axiosInstance.post<{ 
    success: boolean; 
    data: { 
      user: User; 
      tokens?: { 
        accessToken: string; 
        refreshToken: string; 
      }; 
    }; 
    message: string; 
  }>("/auth/login", payload);
  
  // If tokens are provided in response (fallback for incognito mode), store them
  if (response.data.data.tokens) {
    localStorage.setItem("accessToken", response.data.data.tokens.accessToken);
    localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken);
  }
  
  return response.data.data.user;
};

export const logoutApi = async (): Promise<AxiosResponse> => {
  // Clear stored tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return axiosInstance.post("/auth/logout");
};