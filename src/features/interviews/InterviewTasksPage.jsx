import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyInterviews, interviewAssignedRealtime, feedbackSubmittedRealtime } from "./interviewSlice";
import { onInterviewAssigned, onFeedbackSubmitted, offSocketEvent } from "../../helpers/socket";
import FeedbackForm from "./FeedbackForm";
import FeedbackViewer from "./FeedbackViewer";
import Loader from "../../components/ui/Loader";

const InterviewTasksPage = () => {
  const dispatch = useDispatch();
  const { myInterviews, myInterviewsLoading, error } = useSelector((state) => state.interviews);
  const { user } = useSelector((state) => state.auth);
  const { feedbackByInterview } = useSelector((state) => state.interviews);
  
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFeedbackViewer, setShowFeedbackViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getMyInterviews());
  }, [dispatch]);

  // Listen for search events from Navbar
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail.toLowerCase());
    };

    window.addEventListener('interviewSearch', handleSearch);
    return () => window.removeEventListener('interviewSearch', handleSearch);
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handleInterviewAssigned = (data) => {
      dispatch(interviewAssignedRealtime({ ...data, currentUserId: user?.id }));
    };

    const handleFeedbackSubmitted = (data) => {
      dispatch(feedbackSubmittedRealtime(data));
    };

    onInterviewAssigned(handleInterviewAssigned);
    onFeedbackSubmitted(handleFeedbackSubmitted);

    return () => {
      offSocketEvent("interview:assigned");
      offSocketEvent("feedback:submitted");
    };
  }, [dispatch, user?.id]);

  const pendingInterviews = myInterviews.filter(i => i.status === "ASSIGNED");
  const completedInterviews = myInterviews.filter(i => i.status === "COMPLETED");
  
  // Filter interviews based on search query
  const filterInterviews = (interviews) => {
    if (!searchQuery) return interviews;
    
    return interviews.filter(interview => {
      const candidateName = interview.candidateId?.name?.toLowerCase() || '';
      const jobTitle = interview.jobId?.title?.toLowerCase() || '';
      return candidateName.includes(searchQuery) || jobTitle.includes(searchQuery);
    });
  };
  
  const displayedInterviews = activeTab === "pending" 
    ? filterInterviews(pendingInterviews)
    : filterInterviews(completedInterviews);

  const handleSubmitFeedback = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackForm(true);
  };

  const handleViewFeedback = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackViewer(true);
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    setSelectedInterview(null);
  };

  const closeFeedbackViewer = () => {
    setShowFeedbackViewer(false);
    setSelectedInterview(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (myInterviewsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader text="Loading your interview tasks..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Interview Tasks
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Review candidates and submit your feedback
            </p>
          </div>
          
          {pendingInterviews.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
              <p className="text-xs md:text-sm font-semibold text-yellow-800">
                {pendingInterviews.length} Pending Feedback
              </p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1">{pendingInterviews.length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-green-700 font-medium">Completed</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{completedInterviews.length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-blue-700 font-medium">Total</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1">{myInterviews.length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3 text-xs md:text-sm">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-red-800">Error loading interviews</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-yellow-600 text-yellow-600 bg-yellow-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Pending Feedback</span>
                <span className="sm:hidden">Pending</span>
                <span>({pendingInterviews.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "completed"
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Completed ({completedInterviews.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Interview List */}
        <div className="p-4 md:p-6">
          {displayedInterviews.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {activeTab === "pending" ? "No pending interviews" : "No completed interviews"}
              </h3>
              <p className="text-sm md:text-base text-gray-500 px-4">
                {activeTab === "pending" 
                  ? "You're all caught up! New interviews will appear here when assigned."
                  : "Completed interviews will appear here after you submit feedback."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {displayedInterviews.map((interview) => {
                const hasFeedback = feedbackByInterview[interview._id] || interview.status === "COMPLETED";
                
                return (
                  <div
                    key={interview._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
                      {/* Candidate Info */}
                      <div className="flex items-start gap-3 md:gap-4 flex-1 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base md:text-lg font-bold shadow-md shrink-0">
                          {getInitials(interview.candidateId?.name || "?")}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
                            {interview.candidateId?.name || "Unknown Candidate"}
                          </h3>
                          
                          <div className="space-y-1.5 md:space-y-2">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium truncate">{interview.jobId?.title || "Unknown Job"}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate">{formatDate(interview.scheduledAt)}</span>
                            </div>

                            {interview.candidateId?.email && (
                              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{interview.candidateId.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 w-full md:w-auto md:shrink-0">
                        {interview.status === "ASSIGNED" && (
                          <button
                            onClick={() => handleSubmitFeedback(interview)}
                            className="px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Submit Feedback
                          </button>
                        )}
                        
                        {hasFeedback && (
                          <button
                            onClick={() => handleViewFeedback(interview)}
                            className="px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && selectedInterview && (
        <FeedbackForm
          interview={selectedInterview}
          onClose={closeFeedbackForm}
        />
      )}

      {/* Feedback Viewer Modal */}
      {showFeedbackViewer && selectedInterview && (
        <FeedbackViewer
          interview={selectedInterview}
          onClose={closeFeedbackViewer}
        />
      )}
    </div>
  );
};

export default InterviewTasksPage;
