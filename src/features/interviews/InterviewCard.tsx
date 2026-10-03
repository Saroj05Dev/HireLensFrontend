import React, { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import type { Interview } from "../../types/interview.types";

interface InterviewCardProps {
  interview: Interview;
  onSubmitFeedback?: (interview: Interview) => void;
  onViewFeedback?: (interview: Interview) => void;
  showCandidate?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onSubmitFeedback,
  onViewFeedback,
  showCandidate = true,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { feedbackByInterview } = useAppSelector((state) => state.interviews);

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const isInterviewer = user?.role === "INTERVIEWER";

  const interviewerId =
    typeof interview.interviewer === "object"
      ? interview.interviewer?.id
      : interview.interviewerId;

  const userId = user?.id;
  const isMyInterview = interviewerId === userId;
  const hasFeedback = !!feedbackByInterview[interview.id] || interview.status === "COMPLETED";
  const canSubmitFeedback = isInterviewer && isMyInterview && interview.status === "ASSIGNED";

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white p-4 rounded border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {showCandidate && (
            <h4 className="font-medium text-sm mb-1">
              {interview.candidate?.name || "Unknown Candidate"}
            </h4>
          )}

          <p className="text-xs text-gray-600 mb-1">
            Job: {interview.job?.title || "Unknown Job"}
          </p>

          <p className="text-xs text-gray-600 mb-2">
            Interviewer: {interview.interviewer?.name || "Unassigned"}
          </p>

          <p className="text-xs text-gray-500">
            Scheduled: {formatDate(interview.scheduledAt)}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            STATUS_COLORS[interview.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {interview.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        {canSubmitFeedback && onSubmitFeedback && (
          <button
            onClick={() => onSubmitFeedback(interview)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer"
          >
            Submit Feedback
          </button>
        )}

        {hasFeedback && onViewFeedback && (
          <button
            onClick={() => onViewFeedback(interview)}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 cursor-pointer"
          >
            View Feedback
          </button>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:underline cursor-pointer"
        >
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-600 space-y-1">
          {interview.createdAt && (
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          )}
          {interview.notes && (
            <p>
              <span className="font-medium">Notes:</span> {interview.notes}
            </p>
          )}
          {showCandidate && interview.candidate?.email && (
            <p>
              <span className="font-medium">Candidate Email:</span> {interview.candidate.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewCard;