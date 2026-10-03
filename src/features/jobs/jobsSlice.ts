import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  createJobApi,
  fetchJobsApi,
  updateJobApi,
  closeJobApi,
  reopenJobApi,
  deleteJobApi,
} from "./jobs.api.js";
import type {
  Job,
  JobState,
  CreateJobPayload,
  UpdateJobPayload,
} from "../../types/job.types";

interface ApiErrorResponse {
  message?: string;
}

export const fetchJobs = createAsyncThunk<Job[], void, { rejectValue: string }>(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchJobsApi();
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch jobs"
      );
    }
  }
);

export const createJob = createAsyncThunk<Job, CreateJobPayload, { rejectValue: string }>(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const res = await createJobApi(jobData);
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create job"
      );
    }
  }
);

export const updateJob = createAsyncThunk<
  Job,
  { jobId: string; jobData: UpdateJobPayload },
  { rejectValue: string }
>("jobs/updateJob", async ({ jobId, jobData }, { rejectWithValue }) => {
  try {
    const res = await updateJobApi(jobId, jobData);
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update job"
    );
  }
});

export const deleteJob = createAsyncThunk<
  { jobId: string },
  string,
  { rejectValue: string }
>("jobs/deleteJob", async (jobId, { rejectWithValue }) => {
  try {
    const res = await deleteJobApi(jobId);
    return { ...res, jobId };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete job"
    );
  }
});

export const closeJob = createAsyncThunk<Job, string, { rejectValue: string }>(
  "jobs/closeJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await closeJobApi(jobId);
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to close job"
      );
    }
  }
);

export const reopenJob = createAsyncThunk<Job, string, { rejectValue: string }>(
  "jobs/reopenJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await reopenJobApi(jobId);
      return res;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to reopen job"
      );
    }
  }
);

const initialState: JobState = {
  list: [],
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobsCache: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
    updateJobCandidateCount: (
      state,
      action: PayloadAction<{ jobId: string; candidateCount: number }>
    ) => {
      const { jobId, candidateCount } = action.payload;
      const job = state.list.find((j) => j.id === jobId);
      if (job) {
        job.candidateCount = candidateCount;
      }
    },
    incrementJobCandidateCount: (
      state,
      action: PayloadAction<{ jobId: string }>
    ) => {
      const { jobId } = action.payload;
      const job = state.list.find((j) => j.id === jobId);
      if (job) {
        job.candidateCount = (job.candidateCount || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch jobs";
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<Job>) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
        const index = state.list.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter((j) => j.id !== action.payload.jobId);
      })
      .addCase(closeJob.fulfilled, (state, action: PayloadAction<Job>) => {
        const index = state.list.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(reopenJob.fulfilled, (state, action: PayloadAction<Job>) => {
        const index = state.list.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const {
  clearJobsCache,
  updateJobCandidateCount,
  incrementJobCandidateCount,
} = jobSlice.actions;
export default jobSlice.reducer;