import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInterviewFeedback } from "./interviewSlice";
import Loader from "../../components/ui/Loader";

const RECOMMENDATION_CONFIG = {
  PROCEED: { 
    label: "Proceed to next round", 
    color: "bg-green-50 border-green-200 text-green-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bgColor: "bg-green-100"
  },
  HOLD: { 
    label: "Maybe - needs discussion", 
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bgColor: "bg-yellow-100"
  },
  REJECT: { 
    label: "Do not proceed", 
    color: "bg-red-50 border-red-200 text-red-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    bgColor: "bg-red-100"
  },
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
    return (
      <div className="flex gap-0.5 md:gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 md:w-6 md:h-6 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const recommendationConfig = feedback ? RECOMMENDATION_CONFIG[feedback.recommendation] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-xl font-bold text-gray-900 truncate">Interview Feedback</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">
                  {interview.candidateId?.name} • {interview.jobId?.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 md:p-2 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader text="Loading feedback..." />
            </div>
          ) : !feedback ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm md:text-base text-gray-600 font-medium">No feedback available</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Feedback has not been submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Interviewer Info */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base shrink-0">
                    {interview.interviewerId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                      {interview.interviewerId?.name}
                    </p>
                    <p className="text-xs text-gray-500">Interviewer</p>
                  </div>
                </div>
              </div>

              {/* Rating & Recommendation Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 md:p-5 border border-yellow-200">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Overall Rating
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    {renderStars(feedback.rating)}
                    <span className="text-xl md:text-2xl font-bold text-gray-900 shrink-0">
                      {feedback.rating}/5
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`rounded-lg p-4 md:p-5 border-2 ${recommendationConfig.color}`}>
                  <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recommendation
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="text-current shrink-0">{recommendationConfig.icon}</div>
                    <span className="text-xs md:text-sm font-semibold">
                      {recommendationConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Strengths
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{feedback.strengths}</p>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Areas for Improvement
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{feedback.weaknesses}</p>
                </div>
              </div>

              {/* Additional Notes */}
              {feedback.notes && (
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Additional Notes
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{feedback.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-3 md:pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackViewer;