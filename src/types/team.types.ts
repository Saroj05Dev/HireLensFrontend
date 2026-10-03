export type TeamRole = "ADMIN" | "RECRUITER" | "INTERVIEWER" | string;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  isActive: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
  token: string;
  organizationId?: string;
  createdAt: string;
  expiresAt: string;
  [key: string]: any;
}

export interface InviteUserPayload {
  email: string;
  role: TeamRole;
}

export interface InviteUserResponse {
  invite: PendingInvite;
  [key: string]: any;
}

export interface DeactivateMemberPayload {
  orgId: string;
  userId: string;
}

export interface TeamState {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  loading: boolean;
  error: string | null;
  inviteModalOpen: boolean;
  lastCreatedInvite: InviteUserResponse | null;
}