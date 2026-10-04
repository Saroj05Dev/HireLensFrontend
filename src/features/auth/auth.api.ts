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

export const loginApi = async (payload: LoginPayload): Promise<User> => {
  const response = await axiosInstance.post<{ success: boolean; data: User; message: string }>("/auth/login", payload);
  return response.data.data;
};

export const logoutApi = async (): Promise<AxiosResponse> => {
  return axiosInstance.post("/auth/logout");
};