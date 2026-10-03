import axios from "axios";
import type {
  UserProfile,
  UpdateProfilePayload,
  UploadAvatarResponse,
} from "../../types/profile.types";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3500/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getProfile = async (): Promise<{ data: UserProfile }> => {
  const response = await api.get<{ data: UserProfile }>("/profile");
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfilePayload
): Promise<{ data: UserProfile }> => {
  const response = await api.put<{ data: UserProfile }>("/profile", data);
  return response.data;
};

export const uploadAvatar = async (
  file: File
): Promise<{ data: UploadAvatarResponse }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<{ data: UploadAvatarResponse }>(
    "/profile/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};