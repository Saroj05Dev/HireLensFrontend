export type UserRole = "ADMIN" | "INTERVIEWER" | "MEMBER" | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  password?: string;
  newPassword?: string;
  token?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password?: string;
  companyName?: string;
  [key: string]: any;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password?: string;
}