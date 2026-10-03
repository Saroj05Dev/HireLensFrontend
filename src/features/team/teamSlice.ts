import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  fetchMembersApi,
  fetchPendingInvitesApi,
  inviteUserApi,
  deactivateMemberApi,
} from "./team.api";
import type { RootState } from "../../store/store";
import type {
  TeamMember,
  PendingInvite,
  TeamState,
  InviteUserPayload,
  InviteUserResponse,
  DeactivateMemberPayload,
} from "../../types/team.types";

interface ApiErrorResponse {
  message?: string;
}

// Fetch organization members
export const fetchMembers = createAsyncThunk<
  TeamMember[],
  void,
  { rejectValue: string }
>("team/fetchMembers", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchMembersApi();
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch members"
    );
  }
});

// Fetch pending invitations
export const fetchPendingInvites = createAsyncThunk<
  PendingInvite[],
  void,
  { rejectValue: string }
>("team/fetchPendingInvites", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchPendingInvitesApi();
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch pending invites"
    );
  }
});

// Invite a new user
export const inviteUser = createAsyncThunk<
  InviteUserResponse,
  InviteUserPayload,
  { rejectValue: string }
>("team/inviteUser", async ({ email, role }, { rejectWithValue }) => {
  try {
    const res = await inviteUserApi({ email, role });
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to invite user"
    );
  }
});

// Deactivate an organization member
export const deactivateMember = createAsyncThunk<
  { userId: string },
  DeactivateMemberPayload,
  { rejectValue: string }
>("team/deactivateMember", async ({ orgId, userId }, { rejectWithValue }) => {
  try {
    await deactivateMemberApi(orgId, userId);
    return { userId };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to deactivate member"
    );
  }
});

const initialState: TeamState = {
  members: [],
  pendingInvites: [],
  loading: false,
  error: null,
  inviteModalOpen: false,
  lastCreatedInvite: null,
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setInviteModalOpen: (state, action: PayloadAction<boolean>) => {
      state.inviteModalOpen = action.payload;
    },
    clearLastCreatedInvite: (state) => {
      state.lastCreatedInvite = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMembers.fulfilled,
        (state, action: PayloadAction<TeamMember[]>) => {
          state.loading = false;
          state.members = action.payload;
        }
      )
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch members";
      })

      // Fetch pending invites
      .addCase(fetchPendingInvites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPendingInvites.fulfilled,
        (state, action: PayloadAction<PendingInvite[]>) => {
          state.loading = false;
          state.pendingInvites = action.payload;
        }
      )
      .addCase(fetchPendingInvites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch invites";
      })

      // Invite user
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        inviteUser.fulfilled,
        (state, action: PayloadAction<InviteUserResponse>) => {
          state.loading = false;
          state.lastCreatedInvite = action.payload;
          state.pendingInvites.unshift(action.payload.invite);
        }
      )
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to invite user";
      })

      // Deactivate member
      .addCase(deactivateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deactivateMember.fulfilled,
        (state, action: PayloadAction<{ userId: string }>) => {
          state.loading = false;
          const { userId } = action.payload;
          const member = state.members.find((m) => m.id === userId);
          if (member) {
            member.isActive = false;
          }
        }
      )
      .addCase(deactivateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to deactivate member";
      });
  },
});

export const { setInviteModalOpen, clearLastCreatedInvite, clearError } =
  teamSlice.actions;

// Selectors
export const selectMembers = (state: RootState) => state.team.members;
export const selectPendingInvites = (state: RootState) =>
  state.team.pendingInvites;
export const selectTeamLoading = (state: RootState) => state.team.loading;
export const selectTeamError = (state: RootState) => state.team.error;
export const selectInviteModalOpen = (state: RootState) =>
  state.team.inviteModalOpen;
export const selectLastCreatedInvite = (state: RootState) =>
  state.team.lastCreatedInvite;

export default teamSlice.reducer;