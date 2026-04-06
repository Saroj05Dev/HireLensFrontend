import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentActivityApi } from "./dashboard.api";
import { onDecisionCreated, offSocketEvent } from "../helpers/socket";

const ACTIVITY_FILTERS = [
  { key: "", label: "All Activity" },
  { key: "STAGE_CHANGE", label: "Stage Changes" },
  { key: "INTERVIEW_ASSIGNED", label: "Interviews" },
  { key: "FEEDBACK_SUBMITTED", label: "Feedback" },
  { key: "CANDIDATE_ADDED", label: "New Candidates" },
];

const ActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchActivities(1, true);
    
    // Set up real-time listener for new activities
    const handleNewDecision = (data) => {
      setActivities(prev => [data, ...prev]);
    };
    
    onDecisionCreated(handleNewDecision);
    
    return () => {
      offSocketEvent("decision:created");
    };
  }, []);

  const fetchActivities = async (pageNum, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await getRecentActivityApi(ITEMS_PER_PAGE * pageNum);
      
      if (reset) {
        setActivities(data);
      } else {
        setActivities(prev => [...prev, ...data.slice(prev.length)]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE * pageNum);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(page + 1);
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
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredActivity = activityFilter 
    ? activities.filter(activity => activity.actionType === activityFilter)
    : activities;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-gray-600 mt-1">Complete history of your hiring pipeline activities</p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Activities</h2>
            <span className="text-sm text-gray-500">
              {filteredActivity.length} {filteredActivity.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          {/* Activity Filters */}
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActivityFilter(filter.key)}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
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

        <div className="divide-y divide-gray-100">
          {filteredActivity.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 mb-1">
                {activityFilter ? "No activity found for this filter" : "No activity yet"}
              </p>
              <p className="text-sm text-gray-400">
                {activityFilter ? "Try selecting a different filter" : "Activity will appear here as actions are taken"}
              </p>
            </div>
          ) : (
            <>
              {filteredActivity.map((activity, index) => (
                <div key={activity._id || index} className="p-4 md:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(activity.actionType)}`}>
                      {getActionIcon(activity.actionType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm md:text-base text-gray-900">
                            <span className="font-medium">{activity.performedBy?.name || "Someone"}</span>
                            {" "}
                            <span className="text-gray-600">{activity.note}</span>
                          </p>
                          
                          {activity.candidateId && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
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
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="p-6 text-center border-t border-gray-200">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Load More
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
