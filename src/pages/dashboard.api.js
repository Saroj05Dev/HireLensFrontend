import axiosInstance from "../helpers/axiosInstance";

export const getDashboardStatsApi = async () => {
  const response = await axiosInstance.get("/analytics/dashboard/stats");
  return response.data.data;
};

export const getRecentActivityApi = async (limit = 10) => {
  const response = await axiosInstance.get(`/analytics/dashboard/activity?limit=${limit}`);
  return response.data.data;
};

export const getCandidatesByStageApi = async () => {
  const response = await axiosInstance.get("/analytics/dashboard/candidates-by-stage");
  return response.data.data;
};
