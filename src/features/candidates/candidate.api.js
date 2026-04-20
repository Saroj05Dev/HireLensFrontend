import axiosInstance from "../../helpers/axiosInstance";

// Add candidate to a job
export const addCandidateApi = async (candidateData) => {
  const isMultipart = candidateData instanceof FormData;
  const response = await axiosInstance.post("/candidates", candidateData, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data.data;
};

// Get candidates for a specific job
export const getCandidatesByJobApi = async (jobId) => {
  const response = await axiosInstance.get(`/candidates/job/${jobId}`);
  return response.data.data;
};

// Get all candidates with optional filters
export const getAllCandidatesApi = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.stage) params.append("stage", filters.stage);
  if (filters.jobId) params.append("jobId", filters.jobId);
  
  const response = await axiosInstance.get(`/candidates?${params.toString()}`);
  return response.data.data;
};

// Update candidate stage
export const updateCandidateStageApi = async (candidateId, { newStage, note }) => {
  const response = await axiosInstance.patch(`/candidates/${candidateId}/stage`, {
    newStage,
    note,
  });
  return response.data.data;
};

// Get candidate profile
export const getCandidateProfileApi = async (candidateId) => {
  const response = await axiosInstance.get(`/candidates/${candidateId}`);
  return response.data.data;
};

// Get candidate decision logs
export const getCandidateDecisionLogsApi = async (candidateId) => {
  const response = await axiosInstance.get(`/candidates/${candidateId}/decision-logs`);
  return response.data.data;
};

// Get interviews for a candidate
export const getCandidateInterviewsApi = async (candidateId) => {
  const response = await axiosInstance.get(`/candidates/${candidateId}/interviews`);
  return response.data.data;
};

// Reopen a rejected candidate
export const reopenCandidateApi = async (candidateId, { note } = {}) => {
  const response = await axiosInstance.patch(`/candidates/${candidateId}/reopen`, { note });
  return response.data.data;
};

// Parse uploaded resume and extract basic contact details
export const parseResumeApi = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  const response = await axiosInstance.post("/candidates/parse-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data;
};