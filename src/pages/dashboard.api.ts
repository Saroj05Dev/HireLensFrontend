import axiosInstance from "../helpers/axiosInstance";

export interface DashboardStats {
  openJobs: number;
  activeCandidates: number;
  pendingInterviews: number;
  totalJobs: number;
  totalCandidates: number;
  totalInterviews: number;
}

export interface CandidateStageDistribution {
  stage: string;
  count: number;
}

export interface RecentActivityItem {
  id?: string;
  actionType: "STAGE_CHANGE" | "INTERVIEW_ASSIGNED" | "FEEDBACK_SUBMITTED" | "CANDIDATE_ADDED" | string;
  performedBy?: {
    id?: string;
    name?: string;
    email?: string;
  };
  note?: string;
  candidate?: {
    id?: string;
    name?: string;
  };
  job?: {
    id?: string;
    title?: string;
  };
  createdAt: string;
  [key: string]: any;
}

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get<{ data: DashboardStats }>(
    "/analytics/dashboard/stats"
  );
  return response.data.data;
};

export const getRecentActivityApi = async (
  limit: number = 10
): Promise<RecentActivityItem[]> => {
  const response = await axiosInstance.get<{ data: RecentActivityItem[] }>(
    `/analytics/dashboard/activity?limit=${limit}`
  );
  return response.data.data;
};

export const getCandidatesByStageApi = async (): Promise<CandidateStageDistribution[]> => {
  const response = await axiosInstance.get<{ data: CandidateStageDistribution[] }>(
    "/analytics/dashboard/candidates-by-stage"
  );
  return response.data.data;
};