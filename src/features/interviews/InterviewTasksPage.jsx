import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyInterviews, interviewAssignedRealtime, feedbackSubmittedRealtime } from "./interviewSlice";
import { onInterviewAssigned, onFeedbackSubmitted, offSocketEvent } from "../../helpers/socket";
import Layout from "../../components/layouts/Layout";
import InterviewCard from "./InterviewCard";
import FeedbackForm from "./FeedbackForm";
import FeedbackViewer from "./FeedbackViewer";

const STATUS_FILTERS = [
  { key: "", label: "All Interviews" },
  { key: "ASSIGNED", label: "Pending" },
  { key: "COMPLETED", label: "Completed" },
];

const InterviewTasksPage = () => {
  const dispatch = useDispatch();
  const { myInterviews, myInterviewsLoading, error } = useSelector((state) => state.interviews);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFeedbackViewer, setShowFeedbackViewer] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getMyInterviews());
  }, [dispatch]);

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

  const filteredInterviews = myInterviews.filter(interview => 
    !statusFilter || interview.status === statusFilter
  );

  const pendingCount = myInterviews.filter(i => i.status === "ASSIGNED").length;
  const completedCount = myInterviews.filter(i => i.status === "COMPLETED").length;

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

  if (myInterviewsLoading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">My Interviews</h1>
          <p className="text-gray-500">Loading your interviews...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Interviews</h1>
          <div className="text-sm text-gray-500">
            {myInterviews.length} total interview{myInterviews.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{myInterviews.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded border mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
            
            {statusFilter && (
              <button
                onClick={() => setStatusFilter("")}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">
              {statusFilter 
                ? `No ${statusFilter.toLowerCase()} interviews found`
                : "No interviews assigned yet"
              }
            </p>
            <p className="text-sm text-gray-400">
              {statusFilter 
                ? "Try adjusting your filter" 
                : "Interviews will appear here once they're assigned to you"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onSubmitFeedback={handleSubmitFeedback}
                onViewFeedback={handleViewFeedback}
                showCandidate={true}
              />
            ))}
          </div>
        )}

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
    </Layout>
  );
};

export default InterviewTasksPage;