import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  addCandidateApi,
  getCandidatesByJobApi,
  getAllCandidatesApi,
  updateCandidateStageApi,
  reopenCandidateApi,
  getCandidateProfileApi,
} from "./candidate.api";
import type {
  Candidate,
  CandidateFilters,
  CandidateStage,
  CandidateState,
  UpdateStagePayload,
  ReopenCandidatePayload,
} from "../../types/candidate.types";

interface ApiErrorResponse {
  message?: string;
}

// Add candidate to a job
export const addCandidate = createAsyncThunk<
  Candidate,
  FormData | Record<string, any>,
  { rejectValue: string }
>("candidates/addCandidate", async (candidateData, { rejectWithValue }) => {
  try {
    const res = await addCandidateApi(candidateData);
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(err.response?.data?.message || "Failed to add candidate");
  }
});

// Get candidates for a specific job
export const getCandidatesByJob = createAsyncThunk<
  { jobId: string; candidates: Candidate[] },
  string,
  { rejectValue: string }
>("candidates/getCandidatesByJob", async (jobId, { rejectWithValue }) => {
  try {
    const res = await getCandidatesByJobApi(jobId);
    return { jobId, candidates: res };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to get candidates for job"
    );
  }
});

// Get all candidates with filters
export const getAllCandidates = createAsyncThunk<
  Candidate[],
  CandidateFilters | undefined,
  { rejectValue: string }
>("candidates/getAllCandidates", async (filters = {}, { rejectWithValue }) => {
  try {
    console.log('getAllCandidates thunk: Starting with filters:', filters);
    const res = await getAllCandidatesApi(filters);
    console.log('getAllCandidates thunk: Success, received:', res);
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    console.error('getAllCandidates thunk: Error:', error);
    return rejectWithValue(err.response?.data?.message || "Failed to get candidates");
  }
});

// Update candidate stage
export const updateCandidateStage = createAsyncThunk<
  Candidate & { candidateId: string; newStage: CandidateStage; note?: string },
  UpdateStagePayload,
  { rejectValue: string }
>(
  "candidates/updateCandidateStage",
  async ({ candidateId, newStage, note }, { rejectWithValue }) => {
    try {
      const res = await updateCandidateStageApi(candidateId, { newStage, note });
      return { candidateId, newStage, note, ...res };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update stage"
      );
    }
  }
);

// Get candidate profile
export const getCandidateProfile = createAsyncThunk<
  Candidate,
  string,
  { rejectValue: string }
>("candidates/getCandidateProfile", async (candidateId, { rejectWithValue }) => {
  try {
    const res = await getCandidateProfileApi(candidateId);
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch candidate profile"
    );
  }
});

// Reopen a rejected candidate
export const reopenCandidate = createAsyncThunk<
  Candidate & { candidateId: string; newStage: CandidateStage },
  ReopenCandidatePayload,
  { rejectValue: string }
>("candidates/reopenCandidate", async ({ candidateId, note }, { rejectWithValue }) => {
  try {
    const res = await reopenCandidateApi(candidateId, { note });
    return { candidateId, newStage: "APPLIED", ...res };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to reopen candidate"
    );
  }
});

const initialState: CandidateState = {
  list: [],
  loading: false,
  error: null,

  candidatesByJob: {},
  jobCandidatesLoading: {},

  selectedCandidate: null,
  profileLoading: false,

  stageUpdateLoading: {},
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Real-time updates
    candidateStageUpdatedRealtime: (
      state,
      action: PayloadAction<{ candidateId: string; toStage: CandidateStage }>
    ) => {
      const { candidateId, toStage } = action.payload;

      // Ensure state.list is an array
      if (!Array.isArray(state.list)) {
        state.list = [];
      }

      // Update in main list
      const candidate = state.list.find((c) => c.id === candidateId);
      if (candidate) {
        candidate.currentStage = toStage;
      }

      // Update in job-specific lists
      if (state.candidatesByJob) {
        Object.keys(state.candidatesByJob).forEach((jobId) => {
          const jobCandidates = state.candidatesByJob[jobId];
          if (Array.isArray(jobCandidates)) {
            const jobCandidate = jobCandidates.find(
              (c) => c.id === candidateId
            );
            if (jobCandidate) {
              jobCandidate.currentStage = toStage;
            }
          }
        });
      }

      // Update selected candidate if it's the same one
      if (state.selectedCandidate?.id === candidateId) {
        state.selectedCandidate.currentStage = toStage;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add candidate
      .addCase(addCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.loading = false;
        
        // Ensure state.list is an array
        if (!Array.isArray(state.list)) {
          state.list = [];
        }
        
        state.list.unshift(action.payload);

        const jobId = action.payload.jobId;
        if (state.candidatesByJob && state.candidatesByJob[jobId] && Array.isArray(state.candidatesByJob[jobId])) {
          state.candidatesByJob[jobId].unshift(action.payload);
        }
      })
      .addCase(addCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to add candidate";
      })

      // Get candidates by job
      .addCase(getCandidatesByJob.pending, (state, action) => {
        const jobId = action.meta.arg;
        state.jobCandidatesLoading[jobId] = true;
      })
      .addCase(getCandidatesByJob.fulfilled, (state, action) => {
        const { jobId, candidates } = action.payload;
        state.candidatesByJob[jobId] = candidates;
        state.jobCandidatesLoading[jobId] = false;
      })
      .addCase(getCandidatesByJob.rejected, (state, action) => {
        const jobId = action.meta.arg;
        state.jobCandidatesLoading[jobId] = false;
        state.error = action.payload ?? "Failed to fetch candidates by job";
      })

      // Get all candidates
      .addCase(getAllCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCandidates.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(getAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch all candidates";
      })

      // Update candidate stage
      .addCase(updateCandidateStage.pending, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = true;
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const { candidateId, newStage } = action.payload;
        state.stageUpdateLoading[candidateId] = false;

        // Ensure state.list is an array
        if (!Array.isArray(state.list)) {
          state.list = [];
        }

        const candidate = state.list.find((c) => c.id === candidateId);
        if (candidate) {
          candidate.currentStage = newStage;
        }

        if (state.candidatesByJob) {
          Object.keys(state.candidatesByJob).forEach((jobId) => {
            const jobCandidates = state.candidatesByJob[jobId];
            if (Array.isArray(jobCandidates)) {
              const jobCandidate = jobCandidates.find(
                (c) => c.id === candidateId
              );
              if (jobCandidate) {
                jobCandidate.currentStage = newStage;
              }
            }
          });
        }

        if (state.selectedCandidate?.id === candidateId) {
          state.selectedCandidate.currentStage = newStage;
        }
      })
      .addCase(updateCandidateStage.rejected, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = false;
        state.error = action.payload ?? "Failed to update candidate stage";
      })

      // Reopen candidate
      .addCase(reopenCandidate.pending, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = true;
      })
      .addCase(reopenCandidate.fulfilled, (state, action) => {
        const { candidateId, newStage } = action.payload;
        state.stageUpdateLoading[candidateId] = false;

        const applyChange = (c?: Candidate) => {
          if (c) c.currentStage = newStage;
        };

        // Ensure state.list is an array
        if (!Array.isArray(state.list)) {
          state.list = [];
        }

        applyChange(state.list.find((c) => c.id === candidateId));
        
        if (state.candidatesByJob) {
          Object.values(state.candidatesByJob).forEach((list) => {
            if (Array.isArray(list)) {
              applyChange(list.find((c) => c.id === candidateId));
            }
          });
        }
        
        if (state.selectedCandidate?.id === candidateId) {
          state.selectedCandidate.currentStage = newStage;
        }
      })
      .addCase(reopenCandidate.rejected, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = false;
        state.error = action.payload ?? "Failed to reopen candidate";
      })

      // Get candidate profile
      .addCase(getCandidateProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(
        getCandidateProfile.fulfilled,
        (state, action: PayloadAction<Candidate>) => {
          state.selectedCandidate = action.payload;
          state.profileLoading = false;
        }
      )
      .addCase(getCandidateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload ?? "Failed to fetch candidate profile";
      });
  },
});

export const {
  clearSelectedCandidate,
  clearError,
  candidateStageUpdatedRealtime,
} = candidateSlice.actions;
export default candidateSlice.reducer;