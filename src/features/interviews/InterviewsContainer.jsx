import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllInterviewsApi } from "./interview.api";
import Layout from "../../components/layouts/Layout";
import InterviewCard from "./InterviewCard";
import FeedbackViewer from "./FeedbackViewer";

const STATUS_FILTERS = [
  { key: "", label: "All Interviews" },
  { key: "ASSIGNED", label: "Pending" },
  { key: "COMPLETED", label: "Completed" },
];

const InterviewsContainer = () => {
  const dispatch = useDispatch();
  const { list: jobs } = useSelector((state) => state.jobs);
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackViewer, setShowFeedbackViewer] = useState(false);
  
  const [filters, setFilters] = useState({
    status: "",
    jobId: "",
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const data = await getAllInterviewsApi(filters);
        setInterviews(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewFeedback = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackViewer(true);
  };

  const closeFeedbackViewer = () => {
    setShowFeedbackViewer(false);
    setSelectedInterview(null);
  };

  const pendingCount = interviews.filter(i => i.status === "ASSIGNED").length;
  const completedCount = interviews.filter(i => i.status === "COMPLETED").length;

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Interview Management</h1>
          <p className="text-gray-500">Loading interviews...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <div className="text-sm text-gray-500">
            {interviews.length} total interview{interviews.length !== 1 ? 's' : ''}
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
                <p className="text-2xl font-bold text-blue-600">{interviews.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded border mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Job</label>
              <select
                value={filters.jobId}
                onChange={(e) => handleFilterChange("jobId", e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {(filters.status || filters.jobId) && (
              <button
                onClick={() => setFilters({ status: "", jobId: "" })}
                className="text-sm text-blue-600 hover:underline mt-4"
              >
                Clear filters
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
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No interviews found</p>
            <p className="text-sm text-gray-400">
              {filters.status || filters.jobId 
                ? "Try adjusting your filters" 
                : "Interviews will appear here once they're assigned"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onSubmitFeedback={() => {}} // Recruiters can't submit feedback
                onViewFeedback={handleViewFeedback}
                showCandidate={true}
              />
            ))}
          </div>
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

export default InterviewsContainer;