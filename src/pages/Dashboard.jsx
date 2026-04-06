import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardStatsApi, getRecentActivityApi, getCandidatesByStageApi } from "./dashboard.api";
import { onDecisionCreated, offSocketEvent } from "../helpers/socket";

const ACTIVITY_FILTERS = [
  { key: "", label: "All Activity" },
  { key: "STAGE_CHANGE", label: "Stage Changes" },
  { key: "INTERVIEW_ASSIGNED", label: "Interviews" },
  { key: "FEEDBACK_SUBMITTED", label: "Feedback" },
  { key: "CANDIDATE_ADDED", label: "New Candidates" },
];

const STAGE_COLORS = {
  APPLIED: "#3B82F6",
  SCREENING: "#8B5CF6",
  INTERVIEW: "#F59E0B",
  OFFER: "#10B981",
  HIRED: "#059669",
  REJECTED: "#EF4444",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({
    openJobs: 0,
    activeCandidates: 0,
    pendingInterviews: 0,
    totalJobs: 0,
    totalCandidates: 0,
    totalInterviews: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [candidatesByStage, setCandidatesByStage] = useState([]);
  const [activityFilter, setActivityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listener for new activities
    const handleNewDecision = (data) => {
      setRecentActivity(prev => [data, ...prev].slice(0, 20));
    };
    
    onDecisionCreated(handleNewDecision);
    
    return () => {
      offSocketEvent("decision:created");
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, activityData, stageData] = await Promise.all([
        getDashboardStatsApi(),
        getRecentActivityApi(20),
        getCandidatesByStageApi()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
      setCandidatesByStage(stageData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "STAGE_CHANGE":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "INTERVIEW_ASSIGNED":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "FEEDBACK_SUBMITTED":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "CANDIDATE_ADDED":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case "STAGE_CHANGE":
        return "text-blue-600 bg-blue-50";
      case "INTERVIEW_ASSIGNED":
        return "text-purple-600 bg-purple-50";
      case "FEEDBACK_SUBMITTED":
        return "text-green-600 bg-green-50";
      case "CANDIDATE_ADDED":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredActivity = activityFilter 
    ? recentActivity.filter(activity => activity.actionType === activityFilter)
    : recentActivity;

  // Calculate metrics
  const totalCandidatesInStages = candidatesByStage.reduce((sum, stage) => sum + stage.count, 0);
  const conversionRate = stats.totalCandidates > 0 
    ? ((candidatesByStage.find(s => s._id === "HIRED")?.count || 0) / stats.totalCandidates * 100).toFixed(1)
    : 0;
  const interviewCompletionRate = stats.totalInterviews > 0
    ? (((stats.totalInterviews - stats.pendingInterviews) / stats.totalInterviews) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Welcome back, {user?.name}!
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your hiring pipeline</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Open Jobs */}
        <div 
          onClick={() => navigate("/jobs")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {stats.totalJobs} total
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Open Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.openJobs}</p>
          <p className="text-xs text-gray-500 mt-2">Active job postings</p>
        </div>

        {/* Active Candidates */}
        <div 
          onClick={() => navigate("/candidates")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {stats.totalCandidates} total
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Candidates</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeCandidates}</p>
          <p className="text-xs text-gray-500 mt-2">In hiring pipeline</p>
        </div>

        {/* Pending Interviews */}
        <div 
          onClick={() => navigate("/interviews")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              {stats.totalInterviews} total
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Interviews</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingInterviews}</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting feedback</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900">Conversion Rate</h3>
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-900">{conversionRate}%</p>
          <p className="text-xs text-purple-700 mt-1">Applied to Hired</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Interview Completion</h3>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-blue-900">{interviewCompletionRate}%</p>
          <p className="text-xs text-blue-700 mt-1">Feedback submitted</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900">Pipeline Health</h3>
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-orange-900">{stats.activeCandidates}</p>
          <p className="text-xs text-orange-700 mt-1">Active in pipeline</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Funnel Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Pipeline</h2>
          <div className="space-y-3">
            {candidatesByStage.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No candidates in pipeline yet</p>
            ) : (
              candidatesByStage.map((stage) => {
                const percentage = totalCandidatesInStages > 0 
                  ? (stage.count / totalCandidatesInStages * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={stage._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{stage._id}</span>
                      <span className="text-sm text-gray-600">{stage.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: STAGE_COLORS[stage._id] || "#6B7280"
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stage Distribution Pie Chart (Visual representation) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h2>
          <div className="space-y-2">
            {candidatesByStage.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No data available</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {candidatesByStage.map((stage) => (
                    <div 
                      key={stage._id}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STAGE_COLORS[stage._id] || "#6B7280" }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{stage._id}</p>
                        <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Total Candidates</span>
                    <span className="font-bold text-gray-900">{totalCandidatesInStages}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500 mt-1">Live updates from your hiring pipeline</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActivityFilter(filter.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activityFilter === filter.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {filteredActivity.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 mb-1">
                {activityFilter ? "No activity found for this filter" : "No recent activity"}
              </p>
              <p className="text-sm text-gray-400">
                {activityFilter ? "Try selecting a different filter" : "Activity will appear here as actions are taken"}
              </p>
            </div>
          ) : (
            filteredActivity.map((activity, index) => (
              <div key={activity._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(activity.actionType)}`}>
                    {getActionIcon(activity.actionType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.performedBy?.name || "Someone"}</span>
                          {" "}
                          <span className="text-gray-600">{activity.note}</span>
                        </p>
                        
                        {activity.candidateId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Candidate: {activity.candidateId.name}
                            {activity.jobId && ` • Job: ${activity.jobId.title}`}
                          </p>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredActivity.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button 
              onClick={() => navigate("/activity")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all activity →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
