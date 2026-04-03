import axiosInstance from "../helpers/axiosInstance";

export const getPipelineSummaryApi = async () => {
  const response = await axiosInstance.get("/analytics/pipeline/summary");
  return response.data.data;
};

export const getJobFunnelApi = async (jobId) => {
  const response = await axiosInstance.get(`/analytics/jobs/${jobId}/funnel`);
  return response.data.data;
};

export const getTimeToHireApi = async (jobId) => {
  const response = await axiosInstance.get(`/analytics/jobs/${jobId}/time-to-hire`);
  return response.data.data;
};

export const getOrganizationTimeToHireApi = async () => {
  const response = await axiosInstance.get("/analytics/organization/time-to-hire");
  return response.data.data;
};

export const getCandidateTimeInStageApi = async (candidateId) => {
  const response = await axiosInstance.get(`/analytics/candidates/${candidateId}/time-in-stage`);
  return response.data.data;
};
