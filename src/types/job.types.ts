export type JobStatus = "OPEN" | "CLOSED" | string;

export interface Job {
  id: string;
  title: string;
  description?: string;
  experience?: string;
  location?: string;
  skills: string[];
  status?: JobStatus;
  candidateCount?: number;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateJobPayload {
  title: string;
  description?: string;
  experience?: string;
  location?: string;
  skills: string[];
  [key: string]: any;
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  status?: JobStatus;
}

export interface JobState {
  list: Job[];
  loading: boolean;
  error: string | null;
}