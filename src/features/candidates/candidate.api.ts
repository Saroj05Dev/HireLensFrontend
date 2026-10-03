import axiosInstance from "../../helpers/axiosInstance";
import type {
  Candidate,
  CandidateFilters,
  DecisionLog,
  ParsedResumeData,
  CandidateStage,
} from "../../types/candidate.types";

// Add candidate to a job
export const addCandidateApi = async (
  candidateData: FormData | Record<string, any>
): Promise<Candidate> => {
  const isMultipart = candidateData instanceof FormData;
  const response = await axiosInstance.post<{ data: Candidate }>(
    "/candidates",
    candidateData,
    {
      headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
    }
  );
  return response.data.data;
};

// Get candidates for a specific job
export const getCandidatesByJobApi = async (jobId: string): Promise<Candidate[]> => {
  const response = await axiosInstance.get<{ data: Candidate[] }>(
    `/candidates/job/${jobId}`
  );
  return response.data.data;
};

// Get all candidates with optional filters
export const getAllCandidatesApi = async (
  filters: CandidateFilters = {}
): Promise<Candidate[]> => {
  const params = new URLSearchParams();

  if (filters.stage) params.append("stage", filters.stage);
  if (filters.jobId) params.append("jobId", filters.jobId);
  
  const response = await axiosInstance.get<{ 
    success: boolean;
    data: { 
      candidates: Candidate[];
      counts: any;
    };
    message: string;
  }>(`/candidates?${params.toString()}`);
  
  // Return the candidates array from the nested structure
  return response.data.data.candidates;
};

// Update candidate stage
export const updateCandidateStageApi = async (
  candidateId: string,
  { newStage, note }: { newStage: CandidateStage; note?: string }
): Promise<Candidate> => {
  const response = await axiosInstance.patch<{ data: Candidate }>(
    `/candidates/${candidateId}/stage`,
    {
      newStage,
      note,
    }
  );
  return response.data.data;
};

// Get candidate profile
export const getCandidateProfileApi = async (
  candidateId: string
): Promise<Candidate> => {
  const response = await axiosInstance.get<{ data: Candidate }>(
    `/candidates/${candidateId}`
  );
  return response.data.data;
};

// Get candidate decision logs
export const getCandidateDecisionLogsApi = async (
  candidateId: string
): Promise<DecisionLog[]> => {
  const response = await axiosInstance.get<{ data: DecisionLog[] }>(
    `/candidates/${candidateId}/decision-logs`
  );
  return response.data.data;
};

// Get interviews for a candidate
export const getCandidateInterviewsApi = async (
  candidateId: string
): Promise<any[]> => {
  const response = await axiosInstance.get<{ data: any[] }>(
    `/candidates/${candidateId}/interviews`
  );
  return response.data.data;
};

// Reopen a rejected candidate
export const reopenCandidateApi = async (
  candidateId: string,
  { note }: { note?: string } = {}
): Promise<Candidate> => {
  const response = await axiosInstance.patch<{ data: Candidate }>(
    `/candidates/${candidateId}/reopen`,
    { note }
  );
  return response.data.data;
};

// Parse uploaded resume and extract basic contact details
export const parseResumeApi = async (resumeFile: File): Promise<ParsedResumeData> => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  const response = await axiosInstance.post<{ data: ParsedResumeData }>(
    "/candidates/parse-resume",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data.data;
};