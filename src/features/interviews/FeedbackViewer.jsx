import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInterviewFeedback } from "./interviewSlice";

const RECOMMENDATION_COLORS = {
  PROCEED: "text-green-600 bg-green-50",
  MAYBE: "text-yellow-600 bg-yellow-50", 
  REJECT: "text-red-600 bg-red-50",
};

const RECOMMENDATION_LABELS = {
  PROCEED: "Proceed to next round",
  MAYBE: "Maybe - needs discussion",
  REJECT: "Do not proceed",
};

const FeedbackViewer = ({ interview, onClose }) => {
  const dispatch = useDispatch();
  const { feedbackByInterview, feedbackLoading } = useSelector((state) => state.interviews);
  
  const feedback = feedbackByInterview[interview._id];
  const loading = feedbackLoading[interview._id];

  useEffect(() => {
    if (!feedback && !loading) {
      dispatch(getInterviewFeedback(interview._id));
    }
  }, [dispatch, interview._id, feedback, loading]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Interview Feedback</h2>
              <p className="text-gray-600 mt-1">
                {interview.candidateId?.name} - {interview.jobId?.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Interviewer: {interview.interviewerId?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading feedback...</p>
            </div>
          ) : !feedback ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <h3 className="font-medium mb-2">Overall Rating</h3>
                <div className="flex items-center gap-2">
                  {renderStars(feedback.rating)}
                  <span className="text-sm text-gray-600">
                    ({feedback.rating}/5)
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h3 className="font-medium mb-2">Recommendation</h3>
                <span className={`inline-block px-3 py-1 rounded text-sm ${RECOMMENDATION_COLORS[feedback.recommendation]}`}>
                  {RECOMMENDATION_LABELS[feedback.recommendation]}
                </span>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-medium mb-2">Strengths</h3>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-700">{feedback.strengths}</p>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="text-sm text-gray-700">{feedback.weaknesses}</p>
                </div>
              </div>

              {/* Additional Notes */}
              {feedback.notes && (
                <div>
                  <h3 className="font-medium mb-2">Additional Notes</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">{feedback.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t text-xs text-gray-500">
                <p>Submitted: {new Date(feedback.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackViewer;