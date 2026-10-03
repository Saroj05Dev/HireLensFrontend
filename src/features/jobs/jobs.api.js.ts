import axiosInstance from "../../helpers/axiosInstance";
import type { Job, CreateJobPayload, UpdateJobPayload } from "../../types/job.types";

export const fetchJobsApi = async (): Promise<Job[]> => {
  const res = await axiosInstance.get<{ data: Job[] }>("/jobs");
  return res.data.data;
};

export const createJobApi = async (jobData: CreateJobPayload): Promise<Job> => {
  const res = await axiosInstance.post<{ data: Job }>("/jobs", jobData);
  return res.data.data;
};

export const updateJobApi = async (
  jobId: string,
  jobData: UpdateJobPayload
): Promise<Job> => {
  const res = await axiosInstance.put<{ data: Job }>(`/jobs/${jobId}`, jobData);
  return res.data.data;
};

export const closeJobApi = async (jobId: string): Promise<Job> => {
  const res = await axiosInstance.patch<{ data: Job }>(`/jobs/${jobId}/close`);
  return res.data.data;
};

export const reopenJobApi = async (jobId: string): Promise<Job> => {
  const res = await axiosInstance.patch<{ data: Job }>(`/jobs/${jobId}/reopen`);
  return res.data.data;
};

export const deleteJobApi = async (jobId: string): Promise<any> => {
  const res = await axiosInstance.delete(`/jobs/${jobId}`);
  return res.data.data;
};