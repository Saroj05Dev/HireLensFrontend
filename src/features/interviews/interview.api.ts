import axiosInstance from "../../helpers/axiosInstance";
import type {
  Interview,
  AssignInterviewPayload,
  SubmitFeedbackPayload,
  InterviewFeedback,
  InterviewFilters,
  InterviewerUser,
  InterviewStatus,
} from "../../types/interview.types";

// Assign interview to a candidate (Recruiter only)
export const assignInterviewApi = async (
  interviewData: AssignInterviewPayload
): Promise<Interview> => {
  const response = await axiosInstance.post<{ data: Interview }>(
    "/interviews/assign",
    interviewData
  );
  return response.data.data;
};

// Get interviews for a specific job (Recruiter view)
export const getInterviewsByJobApi = async (
  jobId: string
): Promise<Interview[]> => {
  const response = await axiosInstance.get<{ data: Interview[] }>(
    `/interviews/job/${jobId}`
  );
  return response.data.data;
};

// Get my assigned interviews (Interviewer view)
export const getMyInterviewsApi = async (): Promise<Interview[]> => {
  const response = await axiosInstance.get<{ data: Interview[] }>(
    "/interviews/my"
  );
  return response.data.data;
};

// Submit interview feedback (Interviewer only)
export const submitFeedbackApi = async (
  interviewId: string,
  feedbackData: SubmitFeedbackPayload
): Promise<InterviewFeedback> => {
  const response = await axiosInstance.post<{ data: InterviewFeedback }>(
    `/interviews/${interviewId}/feedback`,
    feedbackData
  );
  return response.data.data;
};

// Get feedback for an interview
export const getInterviewFeedbackApi = async (
  interviewId: string
): Promise<InterviewFeedback> => {
  const response = await axiosInstance.get<{ data: InterviewFeedback }>(
    `/interviews/${interviewId}/feedback`
  );
  return response.data.data;
};

// Update interview status
export const updateInterviewStatusApi = async (
  interviewId: string,
  status: InterviewStatus
): Promise<Interview> => {
  const response = await axiosInstance.patch<{ data: Interview }>(
    `/interviews/${interviewId}/status`,
    { status }
  );
  return response.data.data;
};

// Get all interviewers (Admin/Recruiter view)
export const getAllInterviewsApi = async (
  filters: InterviewFilters = {}
): Promise<Interview[]> => {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.jobId) params.append("jobId", filters.jobId);
  if (filters.candidateId) params.append("candidateId", filters.candidateId);

  const response = await axiosInstance.get<{ data: Interview[] }>(
    `/interviews?${params.toString()}`
  );
  return response.data.data;
};

// Get interviewers in the organization (Recruiter)
export const getInterviewersApi = async (): Promise<InterviewerUser[]> => {
  const response = await axiosInstance.get<{ data: InterviewerUser[] }>(
    "/interviews/interviewers"
  );
  return response.data.data;
};