import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createJobApi, fetchJobsApi, updateJobApi, closeJobApi, reopenJobApi, deleteJobApi } from "./jobs.api.js";

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchJobsApi();
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const res = await createJobApi(jobData);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const res = await updateJobApi(jobId, jobData);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await deleteJobApi(jobId);
      return { ...res, jobId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const closeJob = createAsyncThunk(
  "jobs/closeJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await closeJobApi(jobId);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const reopenJob = createAsyncThunk(
  "jobs/reopenJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await reopenJobApi(jobId);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.list.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter(job => job.id !== action.payload.jobId);
      })
      .addCase(closeJob.fulfilled, (state, action) => {
        const index = state.list.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(reopenJob.fulfilled, (state, action) => {
        const index = state.list.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
    },
});

export default jobSlice.reducer;