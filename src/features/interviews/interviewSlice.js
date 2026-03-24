import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  assignInterviewApi,
  getInterviewsByJobApi,
  getMyInterviewsApi,
  submitFeedbackApi,
  getInterviewFeedbackApi,
  updateInterviewStatusApi
} from "./interview.api";

// Assign interview to a candidate (Recruiter only)
export const assignInterview = createAsyncThunk(
  "interviews/assignInterview",
  async (interviewData, { rejectWithValue }) => {
    try {
      const res = await assignInterviewApi(interviewData);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get interviews for a specific job (Recruiter view)
export const getInterviewsByJob = createAsyncThunk(
  "interviews/getInterviewsByJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getInterviewsByJobApi(jobId);
      return { jobId, interviews: res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get my assigned interviews (Interviewer view)
export const getMyInterviews = createAsyncThunk(
  "interviews/getMyInterviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyInterviewsApi();
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Submit interview feedback (Interviewer only)
export const submitFeedback = createAsyncThunk(
  "interviews/submitFeedback",
  async ({ interviewId, feedbackData }, { rejectWithValue }) => {
    try {
      const res = await submitFeedbackApi(interviewId, feedbackData);
      return { interviewId, feedback: res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Get feedback for an interview
export const getInterviewFeedback = createAsyncThunk(
  "interviews/getInterviewFeedback",
  async (interviewId, { rejectWithValue }) => {
    try {
      const res = await getInterviewFeedbackApi(interviewId);
      return { interviewId, feedback: res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update interview status (mark as completed)
export const updateInterviewStatus = createAsyncThunk(
  "interviews/updateInterviewStatus",
  async ({ interviewId, status }, { rejectWithValue }) => {
    try {
      const res = await updateInterviewStatusApi(interviewId, status);
      return { interviewId, status, ...res };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const interviewSlice = createSlice({
  name: "interviews",
  initialState: {
    // All interviews list
    list: [],
    loading: false,
    error: null,

    // Interviews by job (for recruiters)
    interviewsByJob: {},
    jobInterviewsLoading: {},

    // My interviews (for interviewers)
    myInterviews: [],
    myInterviewsLoading: false,

    // Feedback management
    feedbackByInterview: {},
    feedbackLoading: {},

    // Assignment/submission loading states
    assignLoading: false,
    submitLoading: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Real-time updates
    interviewAssignedRealtime: (state, action) => {
      const interview = action.payload;
      
      // Add to main list
      state.list.unshift(interview);
      
      // Add to job-specific list if it exists
      if (state.interviewsByJob[interview.jobId]) {
        state.interviewsByJob[interview.jobId].unshift(interview);
      }
      
      // Add to my interviews if I'm the interviewer
      const currentUserId = action.payload.currentUserId;
      if (interview.interviewerId === currentUserId) {
        state.myInterviews.unshift(interview);
      }
    },
    feedbackSubmittedRealtime: (state, action) => {
      const { interviewId, feedback } = action.payload;
      
      // Update feedback cache
      state.feedbackByInterview[interviewId] = feedback;
      
      // Update interview status in all lists
      const updateInterviewStatus = (interview) => {
        if (interview._id === interviewId) {
          interview.status = "COMPLETED";
        }
      };
      
      state.list.forEach(updateInterviewStatus);
      state.myInterviews.forEach(updateInterviewStatus);
      Object.values(state.interviewsByJob).forEach(interviews => 
        interviews.forEach(updateInterviewStatus)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Assign interview
      .addCase(assignInterview.pending, (state) => {
        state.assignLoading = true;
        state.error = null;
      })
      .addCase(assignInterview.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.list.unshift(action.payload);
        
        // Add to job-specific list if it exists
        const jobId = action.payload.jobId;
        if (state.interviewsByJob[jobId]) {
          state.interviewsByJob[jobId].unshift(action.payload);
        }
      })
      .addCase(assignInterview.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload;
      })

      // Get interviews by job
      .addCase(getInterviewsByJob.pending, (state, action) => {
        const jobId = action.meta.arg;
        state.jobInterviewsLoading[jobId] = true;
      })
      .addCase(getInterviewsByJob.fulfilled, (state, action) => {
        const { jobId, interviews } = action.payload;
        state.interviewsByJob[jobId] = interviews;
        state.jobInterviewsLoading[jobId] = false;
      })
      .addCase(getInterviewsByJob.rejected, (state, action) => {
        const jobId = action.meta.arg;
        state.jobInterviewsLoading[jobId] = false;
        state.error = action.payload;
      })

      // Get my interviews
      .addCase(getMyInterviews.pending, (state) => {
        state.myInterviewsLoading = true;
      })
      .addCase(getMyInterviews.fulfilled, (state, action) => {
        state.myInterviews = action.payload;
        state.myInterviewsLoading = false;
      })
      .addCase(getMyInterviews.rejected, (state, action) => {
        state.myInterviewsLoading = false;
        state.error = action.payload;
      })

      // Submit feedback
      .addCase(submitFeedback.pending, (state, action) => {
        const { interviewId } = action.meta.arg;
        state.submitLoading[interviewId] = true;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        const { interviewId, feedback } = action.payload;
        state.submitLoading[interviewId] = false;
        state.feedbackByInterview[interviewId] = feedback;
        
        // Update interview status to COMPLETED
        const updateStatus = (interview) => {
          if (interview._id === interviewId) {
            interview.status = "COMPLETED";
          }
        };
        
        state.list.forEach(updateStatus);
        state.myInterviews.forEach(updateStatus);
        Object.values(state.interviewsByJob).forEach(interviews => 
          interviews.forEach(updateStatus)
        );
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        const { interviewId } = action.meta.arg;
        state.submitLoading[interviewId] = false;
        state.error = action.payload;
      })

      // Get interview feedback
      .addCase(getInterviewFeedback.pending, (state, action) => {
        const interviewId = action.meta.arg;
        state.feedbackLoading[interviewId] = true;
      })
      .addCase(getInterviewFeedback.fulfilled, (state, action) => {
        const { interviewId, feedback } = action.payload;
        state.feedbackByInterview[interviewId] = feedback;
        state.feedbackLoading[interviewId] = false;
      })
      .addCase(getInterviewFeedback.rejected, (state, action) => {
        const interviewId = action.meta.arg;
        state.feedbackLoading[interviewId] = false;
        state.error = action.payload;
      })

      // Update interview status
      .addCase(updateInterviewStatus.fulfilled, (state, action) => {
        const { interviewId, status } = action.payload;
        
        const updateStatus = (interview) => {
          if (interview._id === interviewId) {
            interview.status = status;
          }
        };
        
        state.list.forEach(updateStatus);
        state.myInterviews.forEach(updateStatus);
        Object.values(state.interviewsByJob).forEach(interviews => 
          interviews.forEach(updateStatus)
        );
      });
  },
});

export const { clearError, interviewAssignedRealtime, feedbackSubmittedRealtime } = interviewSlice.actions;
export default interviewSlice.reducer;