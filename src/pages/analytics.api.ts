import axiosInstance from "../helpers/axiosInstance";

export interface JobFunnelData {
  funnel: Record<string, number>;
  [key: string]: any;
}

export interface TimeToHireData {
  averageTimeToHireDays: number;
  hires: Array<{
    candidateId: string;
    timeToHireDays: number;
  }>;
}

export interface OrganizationTimeToHireData {
  averageTimeToHireDays: number;
}

export const getPipelineSummaryApi = async (): Promise<any> => {
  const response = await axiosInstance.get("/analytics/pipeline/summary");
  return response.data.data;
};

export const getJobFunnelApi = async (jobId: string): Promise<JobFunnelData> => {
  const response = await axiosInstance.get<{ data: JobFunnelData }>(
    `/analytics/jobs/${jobId}/funnel`
  );
  return response.data.data;
};

export const getTimeToHireApi = async (jobId: string): Promise<TimeToHireData> => {
  const response = await axiosInstance.get<{ data: TimeToHireData }>(
    `/analytics/jobs/${jobId}/time-to-hire`
  );
  return response.data.data;
};

export const getOrganizationTimeToHireApi = async (): Promise<OrganizationTimeToHireData> => {
  const response = await axiosInstance.get<{ data: OrganizationTimeToHireData }>(
    "/analytics/organization/time-to-hire"
  );
  return response.data.data;
};

export const getCandidateTimeInStageApi = async (candidateId: string): Promise<any> => {
  const response = await axiosInstance.get(
    `/analytics/candidates/${candidateId}/time-in-stage`
  );
  return response.data.data;
};