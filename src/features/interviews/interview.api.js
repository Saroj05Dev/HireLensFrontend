import axiosInstance from "../../helpers/axiosInstance";

// Assign interview to a candidate (Recruiter only)
export const assignInterviewApi = async (interviewData) => {
  const response = await axiosInstance.post("/interviews/assign", interviewData);
  return response.data.data;
};

// Get interviews for a specific job (Recruiter view)
export const getInterviewsByJobApi = async (jobId) => {
  const response = await axiosInstance.get(`/interviews/job/${jobId}`);
  return response.data.data;
};

// Get my assigned interviews (Interviewer view)
export const getMyInterviewsApi = async () => {
  const response = await axiosInstance.get("/interviews/my");
  return response.data.data;
};

// Submit interview feedback (Interviewer only)
export const submitFeedbackApi = async (interviewId, feedbackData) => {
  const response = await axiosInstance.post(`/interviews/${interviewId}/feedback`, feedbackData);
  return response.data.data;
};

// Get feedback for an interview
export const getInterviewFeedbackApi = async (interviewId) => {
  const response = await axiosInstance.get(`/interviews/${interviewId}/feedback`);
  return response.data.data;
};

// Update interview status
export const updateInterviewStatusApi = async (interviewId, status) => {
  const response = await axiosInstance.patch(`/interviews/${interviewId}/status`, { status });
  return response.data.data;
};

// Get all interviewers (Admin/Recruiter view)
export const getAllInterviewsApi = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append("status", filters.status);
  if (filters.jobId) params.append("jobId", filters.jobId);
  if (filters.candidateId) params.append("candidateId", filters.candidateId);
  
  const response = await axiosInstance.get(`/interviews?${params.toString()}`);
  return response.data.data;
};

// Get interviewers in the organization (Recruiter)
export const getInterviewersApi = async () => {
  const response = await axiosInstance.get("/interviews/interviewers");
  return response.data.data;
};