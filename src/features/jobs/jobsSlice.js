import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createJobApi, fetchJobsApi } from "./jobs.api.js";

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
      });
    },
});

export default jobSlice.reducer;