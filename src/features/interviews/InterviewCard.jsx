import { useState } from "react";
import { useSelector } from "react-redux";

const STATUS_COLORS = {
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const InterviewCard = ({ interview, onSubmitFeedback, onViewFeedback, showCandidate = true }) => {
  const { user } = useSelector((state) => state.auth);
  const { feedbackByInterview } = useSelector((state) => state.interviews);
  
  const [showDetails, setShowDetails] = useState(false);
  
  const isInterviewer = user?.role === "INTERVIEWER";
  
  // Handle both populated object and string ID
  const interviewerId = typeof interview.interviewerId === 'object' 
    ? interview.interviewerId?._id 
    : interview.interviewerId;
  
  // Handle both user.id and user._id
  const userId = user?.id || user?._id;
  const isMyInterview = interviewerId === userId;
  const hasFeedback = feedbackByInterview[interview._id] || interview.status === "COMPLETED";
  const canSubmitFeedback = isInterviewer && isMyInterview && interview.status === "ASSIGNED";

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white p-4 rounded border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {showCandidate && (
            <h4 className="font-medium text-sm mb-1">
              {interview.candidateId?.name || "Unknown Candidate"}
            </h4>
          )}
          
          <p className="text-xs text-gray-600 mb-1">
            Job: {interview.jobId?.title || "Unknown Job"}
          </p>
          
          <p className="text-xs text-gray-600 mb-2">
            Interviewer: {interview.interviewerId?.name || "Unassigned"}
          </p>
          
          <p className="text-xs text-gray-500">
            Scheduled: {formatDate(interview.scheduledAt)}
          </p>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[interview.status]}`}>
          {interview.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        {canSubmitFeedback && (
          <button
            onClick={() => onSubmitFeedback(interview)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        )}
        
        {hasFeedback && (
          <button
            onClick={() => onViewFeedback(interview)}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            View Feedback
          </button>
        )}
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-600 space-y-1">
          <p><span className="font-medium">Created:</span> {new Date(interview.createdAt).toLocaleDateString()}</p>
          {interview.notes && (
            <p><span className="font-medium">Notes:</span> {interview.notes}</p>
          )}
          {showCandidate && interview.candidateId?.email && (
            <p><span className="font-medium">Candidate Email:</span> {interview.candidateId.email}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewCard;