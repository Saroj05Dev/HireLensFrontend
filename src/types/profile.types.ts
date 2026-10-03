export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
  organizationId?: string;
  title?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UpdateProfilePayload {
  name?: string;
  title?: string;
  [key: string]: any;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
  [key: string]: any;
}

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  uploadingAvatar: boolean;
}