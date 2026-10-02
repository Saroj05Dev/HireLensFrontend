import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  assignInterviewApi,
  getInterviewsByJobApi,
  getMyInterviewsApi,
  submitFeedbackApi,
  getInterviewFeedbackApi,
  updateInterviewStatusApi,
} from "./interview.api";
import type {
  Interview,
  InterviewState,
  AssignInterviewPayload,
  SubmitFeedbackPayload,
  InterviewFeedback,
  InterviewStatus,
} from "../../types/interview.types";

interface ApiErrorResponse {
  message?: string;
}

// Assign interview to a candidate (Recruiter only)
export const assignInterview = createAsyncThunk<
  Interview,
  AssignInterviewPayload,
  { rejectValue: string }
>("interviews/assignInterview", async (interviewData, { rejectWithValue }) => {
  try {
    const res = await assignInterviewApi(interviewData);
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to assign interview"
    );
  }
});

// Get interviews for a specific job (Recruiter view)
export const getInterviewsByJob = createAsyncThunk<
  { jobId: string; interviews: Interview[] },
  string,
  { rejectValue: string }
>("interviews/getInterviewsByJob", async (jobId, { rejectWithValue }) => {
  try {
    const res = await getInterviewsByJobApi(jobId);
    return { jobId, interviews: res };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch interviews for job"
    );
  }
});

// Get my assigned interviews (Interviewer view)
export const getMyInterviews = createAsyncThunk<
  Interview[],
  void,
  { rejectValue: string }
>("interviews/getMyInterviews", async (_, { rejectWithValue }) => {
  try {
    const res = await getMyInterviewsApi();
    return res;
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch your interviews"
    );
  }
});

// Submit interview feedback (Interviewer only)
export const submitFeedback = createAsyncThunk<
  { interviewId: string; feedback: InterviewFeedback },
  { interviewId: string; feedbackData: SubmitFeedbackPayload },
  { rejectValue: string }
>(
  "interviews/submitFeedback",
  async ({ interviewId, feedbackData }, { rejectWithValue }) => {
    try {
      const res = await submitFeedbackApi(interviewId, feedbackData);
      return { interviewId, feedback: res };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit feedback"
      );
    }
  }
);

// Get feedback for an interview
export const getInterviewFeedback = createAsyncThunk<
  { interviewId: string; feedback: InterviewFeedback },
  string,
  { rejectValue: string }
>("interviews/getInterviewFeedback", async (interviewId, { rejectWithValue }) => {
  try {
    const res = await getInterviewFeedbackApi(interviewId);
    return { interviewId, feedback: res };
  } catch (error) {
    const err = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to load interview feedback"
    );
  }
});

// Update interview status (mark as completed)
export const updateInterviewStatus = createAsyncThunk<
  Interview & { interviewId: string; status: InterviewStatus },
  { interviewId: string; status: InterviewStatus },
  { rejectValue: string }
>(
  "interviews/updateInterviewStatus",
  async ({ interviewId, status }, { rejectWithValue }) => {
    try {
      const res = await updateInterviewStatusApi(interviewId, status);
      return { interviewId, status, ...res };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update interview status"
      );
    }
  }
);

const initialState: InterviewState = {
  list: [],
  loading: false,
  error: null,

  interviewsByJob: {},
  jobInterviewsLoading: {},

  myInterviews: [],
  myInterviewsLoading: false,

  feedbackByInterview: {},
  feedbackLoading: {},

  assignLoading: false,
  submitLoading: {},
};

const interviewSlice = createSlice({
  name: "interviews",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Real-time updates
    interviewAssignedRealtime: (
      state,
      action: PayloadAction<Interview & { currentUserId?: string }>
    ) => {
      const interview = action.payload;

      // Add to main list
      state.list.unshift(interview);

      // Add to job-specific list if it exists
      if (state.interviewsByJob[interview.jobId]) {
        state.interviewsByJob[interview.jobId].unshift(interview);
      }

      // Add to my interviews if current user is the interviewer
      const currentUserId = action.payload.currentUserId;
      if (interview.interviewerId === currentUserId) {
        state.myInterviews.unshift(interview);
      }
    },
    feedbackSubmittedRealtime: (
      state,
      action: PayloadAction<{ interviewId: string; feedback: InterviewFeedback }>
    ) => {
      const { interviewId, feedback } = action.payload;

      state.feedbackByInterview[interviewId] = feedback;

      const updateStatus = (interview: Interview) => {
        if (interview.id === interviewId) {
          interview.status = "COMPLETED";
        }
      };

      state.list.forEach(updateStatus);
      state.myInterviews.forEach(updateStatus);
      Object.values(state.interviewsByJob).forEach((interviews) =>
        interviews.forEach(updateStatus)
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
      .addCase(assignInterview.fulfilled, (state, action: PayloadAction<Interview>) => {
        state.assignLoading = false;
        state.list.unshift(action.payload);

        const jobId = action.payload.jobId;
        if (state.interviewsByJob[jobId]) {
          state.interviewsByJob[jobId].unshift(action.payload);
        }
      })
      .addCase(assignInterview.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload ?? "Failed to assign interview";
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
        state.error = action.payload ?? "Failed to load interviews";
      })

      // Get my interviews
      .addCase(getMyInterviews.pending, (state) => {
        state.myInterviewsLoading = true;
      })
      .addCase(getMyInterviews.fulfilled, (state, action: PayloadAction<Interview[]>) => {
        state.myInterviews = action.payload;
        state.myInterviewsLoading = false;
      })
      .addCase(getMyInterviews.rejected, (state, action) => {
        state.myInterviewsLoading = false;
        state.error = action.payload ?? "Failed to load your interviews";
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

        const updateStatus = (interview: Interview) => {
          if (interview.id === interviewId) {
            interview.status = "COMPLETED";
          }
        };

        state.list.forEach(updateStatus);
        state.myInterviews.forEach(updateStatus);
        Object.values(state.interviewsByJob).forEach((interviews) =>
          interviews.forEach(updateStatus)
        );
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        const { interviewId } = action.meta.arg;
        state.submitLoading[interviewId] = false;
        state.error = action.payload ?? "Failed to submit feedback";
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
        state.error = action.payload ?? "Failed to get interview feedback";
      })

      // Update interview status
      .addCase(updateInterviewStatus.fulfilled, (state, action) => {
        const { interviewId, status } = action.payload;

        const updateStatus = (interview: Interview) => {
          if (interview.id === interviewId) {
            interview.status = status;
          }
        };

        state.list.forEach(updateStatus);
        state.myInterviews.forEach(updateStatus);
        Object.values(state.interviewsByJob).forEach((interviews) =>
          interviews.forEach(updateStatus)
        );
      });
  },
});

export const {
  clearError,
  interviewAssignedRealtime,
  feedbackSubmittedRealtime,
} = interviewSlice.actions;
export default interviewSlice.reducer;