import axios from "axios";
import axiosInstance from "../../helpers/axiosInstance";
import type {
  TeamMember,
  PendingInvite,
  InviteUserPayload,
  InviteUserResponse,
} from "../../types/team.types";
import type { AcceptInvitePayload, User } from "../../types/auth.types";

// Get all organization members
export const fetchMembersApi = async (): Promise<TeamMember[]> => {
  const response = await axiosInstance.get<{ data: TeamMember[] }>(
    "/organizations/members"
  );
  return response.data.data;
};

// Get pending invitations
export const fetchPendingInvitesApi = async (): Promise<PendingInvite[]> => {
  const response = await axiosInstance.get<{ data: PendingInvite[] }>(
    "/organizations/invites"
  );
  return response.data.data;
};

// Invite a new user
export const inviteUserApi = async ({
  email,
  role,
}: InviteUserPayload): Promise<InviteUserResponse> => {
  const response = await axiosInstance.post<{ data: InviteUserResponse }>(
    "/organizations/invite",
    {
      email,
      role,
    }
  );
  return response.data.data;
};

// Deactivate an organization member
export const deactivateMemberApi = async (
  orgId: string,
  userId: string
): Promise<any> => {
  const response = await axiosInstance.patch(
    `/organizations/${orgId}/members/${userId}/deactivate`
  );
  return response.data.data;
};

// Validate an invite token (PUBLIC - no auth required)
export const validateInviteTokenApi = async (token: string): Promise<any> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/auth/invites/${token}/validate`,
    { withCredentials: true }
  );
  return response.data.data;
};

// Accept an invitation (PUBLIC - no auth required)
export const acceptInviteApi = async ({
  token,
  name,
  password,
}: AcceptInvitePayload): Promise<User> => {
  const response = await axios.post<{
    success: boolean;
    data: {
      user: User;
      tokens?: {
        accessToken: string;
        refreshToken: string;
      };
    };
    message: string;
  }>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/accept-invite`,
    { token, name, password },
    { withCredentials: true }
  );

  // Store tokens in localStorage as fallback (same pattern as login/register)
  if (response.data.data.tokens) {
    localStorage.setItem("accessToken", response.data.data.tokens.accessToken);
    localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken);
  }

  return response.data.data.user;
};