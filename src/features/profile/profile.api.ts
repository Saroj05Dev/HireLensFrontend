import axiosInstance from "../../helpers/axiosInstance";
import type {
  UserProfile,
  UpdateProfilePayload,
  UploadAvatarResponse,
} from "../../types/profile.types";

export const getProfile = async (): Promise<{ data: UserProfile }> => {
  const response = await axiosInstance.get<{ data: UserProfile }>("/profile");
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfilePayload
): Promise<{ data: UserProfile }> => {
  const response = await axiosInstance.put<{ data: UserProfile }>("/profile", data);
  return response.data;
};

export const uploadAvatar = async (
  file: File
): Promise<{ data: UploadAvatarResponse }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axiosInstance.post<{ data: UploadAvatarResponse }>(
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