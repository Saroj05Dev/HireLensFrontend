import axiosInstance from "../../helpers/axiosInstance";
import axios from "axios";

// Get all organization members
export const fetchMembersApi = async () => {
  const response = await axiosInstance.get("/organizations/members");
  return response.data.data;
};

// Get pending invitations
export const fetchPendingInvitesApi = async () => {
  const response = await axiosInstance.get("/organizations/invites");
  return response.data.data;
};

// Invite a new user
export const inviteUserApi = async ({ email, role }) => {
  const response = await axiosInstance.post("/organizations/invite", {
    email,
    role,
  });
  return response.data.data;
};

// Deactivate an organization member
export const deactivateMemberApi = async (orgId, userId) => {
  const response = await axiosInstance.patch(
    `/organizations/${orgId}/members/${userId}/deactivate`
  );
  return response.data.data;
};

// Validate an invite token (PUBLIC - no auth required)
export const validateInviteTokenApi = async (token) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/auth/invites/${token}/validate`,
    { withCredentials: true }
  );
  return response.data.data;
};

// Accept an invitation (PUBLIC - no auth required)
export const acceptInviteApi = async ({ token, name, password }) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/accept-invite`,
    {
      token,
      name,
      password,
    },
    { withCredentials: true }
  );
  return response.data.data;
};
