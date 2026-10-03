export type CandidateStage =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | string;

export interface DecisionLog {
  id: string;
  candidateId: string;
  fromStage: CandidateStage;
  toStage: CandidateStage;
  note?: string;
  changedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  currentStage: CandidateStage;
  resumeUrl?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CandidateFilters {
  stage?: CandidateStage;
  jobId?: string;
}

export interface UpdateStagePayload {
  candidateId: string;
  newStage: CandidateStage;
  note?: string;
}

export interface ReopenCandidatePayload {
  candidateId: string;
  note?: string;
}

export interface CandidateState {
  list: Candidate[];
  loading: boolean;
  error: string | null;

  candidatesByJob: Record<string, Candidate[]>;
  jobCandidatesLoading: Record<string, boolean>;

  selectedCandidate: Candidate | null;
  profileLoading: boolean;

  stageUpdateLoading: Record<string, boolean>;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  summary?: string;
  [key: string]: any;
}