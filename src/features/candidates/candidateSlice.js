import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  addCandidateApi, 
  getCandidatesByJobApi, 
  getAllCandidatesApi,
  updateCandidateStageApi,
  getCandidateProfileApi 
} from "./candidate.api";

// Add candidate to a job
export const addCandidate = createAsyncThunk(
  "candidates/addCandidate",
  async (candidateData, { rejectWithValue }) => {
    try {
      const res = await addCandidateApi(candidateData);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get candidates for a specific job
export const getCandidatesByJob = createAsyncThunk(
  "candidates/getCandidatesByJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getCandidatesByJobApi(jobId);
      return { jobId, candidates: res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get all candidates with filters
export const getAllCandidates = createAsyncThunk(
  "candidates/getAllCandidates",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await getAllCandidatesApi(filters);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update candidate stage
export const updateCandidateStage = createAsyncThunk(
  "candidates/updateCandidateStage",
  async ({ candidateId, newStage, note }, { rejectWithValue }) => {
    try {
      const res = await updateCandidateStageApi(candidateId, { newStage, note });
      return { candidateId, newStage, note, ...res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get candidate profile
export const getCandidateProfile = createAsyncThunk(
  "candidates/getCandidateProfile",
  async (candidateId, { rejectWithValue }) => {
    try {
      const res = await getCandidateProfileApi(candidateId);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const candidateSlice = createSlice({
  name: "candidates",
  initialState: {
    // All candidates list
    list: [],
    loading: false,
    error: null,

    // Candidates by job (for pipeline board)
    candidatesByJob: {},
    jobCandidatesLoading: {},

    // Selected candidate profile
    selectedCandidate: null,
    profileLoading: false,

    // Stage update
    stageUpdateLoading: {},
  },
  reducers: {
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Real-time updates
    candidateStageUpdatedRealtime: (state, action) => {
      const { candidateId, toStage } = action.payload;
      
      // Update in main list
      const candidate = state.list.find(c => c._id === candidateId);
      if (candidate) {
        candidate.currentStage = toStage;
      }

      // Update in job-specific lists
      Object.keys(state.candidatesByJob).forEach(jobId => {
        const jobCandidate = state.candidatesByJob[jobId].find(c => c._id === candidateId);
        if (jobCandidate) {
          jobCandidate.currentStage = toStage;
        }
      });

      // Update selected candidate if it's the same one
      if (state.selectedCandidate?._id === candidateId) {
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
      .addCase(addCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        
        // Add to job-specific list if it exists
        const jobId = action.payload.jobId;
        if (state.candidatesByJob[jobId]) {
          state.candidatesByJob[jobId].unshift(action.payload);
        }
      })
      .addCase(addCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
      })

      // Get all candidates
      .addCase(getAllCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCandidates.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(getAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update candidate stage
      .addCase(updateCandidateStage.pending, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = true;
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const { candidateId, newStage } = action.payload;
        state.stageUpdateLoading[candidateId] = false;

        // Update in main list
        const candidate = state.list.find(c => c._id === candidateId);
        if (candidate) {
          candidate.currentStage = newStage;
        }

        // Update in job-specific lists
        Object.keys(state.candidatesByJob).forEach(jobId => {
          const jobCandidate = state.candidatesByJob[jobId].find(c => c._id === candidateId);
          if (jobCandidate) {
            jobCandidate.currentStage = newStage;
          }
        });

        // Update selected candidate if it's the same one
        if (state.selectedCandidate?._id === candidateId) {
          state.selectedCandidate.currentStage = newStage;
        }
      })
      .addCase(updateCandidateStage.rejected, (state, action) => {
        const { candidateId } = action.meta.arg;
        state.stageUpdateLoading[candidateId] = false;
        state.error = action.payload;
      })

      // Get candidate profile
      .addCase(getCandidateProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(getCandidateProfile.fulfilled, (state, action) => {
        state.selectedCandidate = action.payload;
        state.profileLoading = false;
      })
      .addCase(getCandidateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedCandidate, clearError, candidateStageUpdatedRealtime } = candidateSlice.actions;
export default candidateSlice.reducer;