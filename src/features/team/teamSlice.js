import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchMembersApi,
  fetchPendingInvitesApi,
  inviteUserApi,
  deactivateMemberApi,
} from "./team.api";

// Fetch organization members
export const fetchMembers = createAsyncThunk(
  "team/fetchMembers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchMembersApi();
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch pending invitations
export const fetchPendingInvites = createAsyncThunk(
  "team/fetchPendingInvites",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchPendingInvitesApi();
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Invite a new user
export const inviteUser = createAsyncThunk(
  "team/inviteUser",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const res = await inviteUserApi({ email, role });
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Deactivate an organization member
export const deactivateMember = createAsyncThunk(
  "team/deactivateMember",
  async ({ orgId, userId }, { rejectWithValue }) => {
    try {
      await deactivateMemberApi(orgId, userId);
      return { userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState: {
    members: [],
    pendingInvites: [],
    loading: false,
    error: null,
    inviteModalOpen: false,
    lastCreatedInvite: null,
  },
  reducers: {
    setInviteModalOpen: (state, action) => {
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
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch pending invites
      .addCase(fetchPendingInvites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingInvites.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingInvites = action.payload;
      })
      .addCase(fetchPendingInvites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Invite user
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCreatedInvite = action.payload;
        state.pendingInvites.unshift(action.payload.invite);
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Deactivate member
      .addCase(deactivateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateMember.fulfilled, (state, action) => {
        state.loading = false;
        const { userId } = action.payload;
        
        // Update member's isActive status
        const member = state.members.find((m) => m.id === userId); // Use 'id' instead of '_id'
        if (member) {
          member.isActive = false;
        }
      })
      .addCase(deactivateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setInviteModalOpen, clearLastCreatedInvite, clearError } =
  teamSlice.actions;

// Selectors
export const selectMembers = (state) => state.team.members;
export const selectPendingInvites = (state) => state.team.pendingInvites;
export const selectTeamLoading = (state) => state.team.loading;
export const selectTeamError = (state) => state.team.error;
export const selectInviteModalOpen = (state) => state.team.inviteModalOpen;
export const selectLastCreatedInvite = (state) => state.team.lastCreatedInvite;

export default teamSlice.reducer;
