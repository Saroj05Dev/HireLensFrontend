import type { Candidate } from "./candidate.types";

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | string;

export interface InterviewerUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface InterviewFeedback {
  id?: string;
  interviewId: string;
  rating: number;
  comments: string;
  recommendation?: "STRONG_HIRE" | "HIRE" | "NEUTRAL" | "NO_HIRE" | "STRONG_NO_HIRE" | string;
  submittedBy?: InterviewerUser;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Interview {
  id: string;
  jobId: string;
  candidateId: string;
  interviewerId: string;
  scheduledAt: string;
  status: InterviewStatus;
  notes?: string;
  meetingLink?: string;
  candidate?: Candidate;
  interviewer?: InterviewerUser;
  feedback?: InterviewFeedback;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface AssignInterviewPayload {
  candidateId: string;
  jobId: string;
  interviewerId: string;
  scheduledAt: string;
  notes?: string;
  meetingLink?: string;
  [key: string]: any;
}

export interface SubmitFeedbackPayload {
  rating: number;
  comments: string;
  recommendation?: string;
  [key: string]: any;
}

export interface InterviewFilters {
  status?: InterviewStatus;
  jobId?: string;
  candidateId?: string;
}

export interface InterviewState {
  list: Interview[];
  loading: boolean;
  error: string | null;

  interviewsByJob: Record<string, Interview[]>;
  jobInterviewsLoading: Record<string, boolean>;

  myInterviews: Interview[];
  myInterviewsLoading: boolean;

  feedbackByInterview: Record<string, InterviewFeedback>;
  feedbackLoading: Record<string, boolean>;

  assignLoading: boolean;
  submitLoading: Record<string, boolean>;
}