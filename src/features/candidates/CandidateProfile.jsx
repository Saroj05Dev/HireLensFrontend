import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCandidateDecisionLogsApi, getCandidateInterviewsApi } from "./candidate.api";

const STAGE_COLORS = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  SCREENING: "bg-yellow-50 text-yellow-700 border-yellow-200", 
  INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  OFFER: "bg-indigo-50 text-indigo-700 border-indigo-200",
  HIRED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200"
};

const STAGE_ICONS = {
  APPLIED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  SCREENING: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  INTERVIEW: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  OFFER: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  HIRED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  REJECTED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const CandidateProfile = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [decisionLogs, setDecisionLogs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (activeTab === "timeline") {
      loadDecisionLogs();
    } else if (activeTab === "interviews") {
      loadInterviews();
    }
  }, [activeTab, candidate._id]);

  const loadDecisionLogs = async () => {
    setLoading(true);
    try {
      const logs = await getCandidateDecisionLogsApi(candidate._id);
      setDecisionLogs(logs);
    } catch (error) {
      console.error("Failed to load decision logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const interviewData = await getCandidateInterviewsApi(candidate._id);
      setInterviews(interviewData);
    } catch (error) {
      console.error("Failed to load interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "STAGE_CHANGE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case "INTERVIEW_ASSIGNED":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "FEEDBACK_SUBMITTED":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base md:text-xl font-bold shadow-lg shrink-0">
                {getInitials(candidate.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{candidate.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 md:mt-2">
                  <div className="flex items-center gap-1 text-gray-600 min-w-0">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs md:text-sm truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs md:text-sm">{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border font-medium text-xs md:text-sm flex-1 sm:flex-none justify-center ${STAGE_COLORS[candidate.currentStage]}`}>
                <div className="shrink-0">{STAGE_ICONS[candidate.currentStage]}</div>
                <span className="truncate">{candidate.currentStage}</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 md:p-2 transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
              >
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Resume
              </a>
            )}
            <div className="text-xs md:text-sm text-gray-500">
              Applied {new Date(candidate.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white overflow-x-auto">
          <div className="flex px-4 md:px-6 min-w-max">
            {[
              { key: "details", label: "Candidate Details", shortLabel: "Details", icon: (
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )},
              { key: "timeline", label: "Decision Timeline", shortLabel: "Timeline", icon: (
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { key: "interviews", label: "Interviews", shortLabel: "Interviews", icon: (
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {activeTab === "details" && (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-200">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Email Address</span>
                    <p className="mt-1 text-xs md:text-sm font-medium text-gray-900 break-words">{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</span>
                      <p className="mt-1 text-xs md:text-sm font-medium text-gray-900">{candidate.phone}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Current Stage</span>
                    <p className="mt-1 text-xs md:text-sm font-medium text-gray-900">{candidate.currentStage}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Application Date</span>
                    <p className="mt-1 text-xs md:text-sm font-medium text-gray-900">
                      {new Date(candidate.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {candidate.resumeUrl && (
                <div className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-200">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resume
                  </h3>
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">Resume Document</p>
                          <p className="text-xs text-gray-500">PDF Document</p>
                        </div>
                      </div>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium w-full sm:w-auto justify-center"
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Decision Timeline
                </h3>
                {decisionLogs.length > 0 && (
                  <span className="text-xs md:text-sm text-gray-500">{decisionLogs.length} events</span>
                )}
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm md:text-base text-gray-600">Loading timeline...</p>
                  </div>
                </div>
              ) : decisionLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm md:text-base text-gray-600 font-medium">No timeline events yet</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Events will appear here as actions are taken</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-4 md:space-y-6">
                    {decisionLogs.map((log, index) => (
                      <div key={index} className="relative flex gap-3 md:gap-4">
                        <div className="relative z-10 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-full border-2 md:border-4 border-white shadow-sm shrink-0">
                          <div className="text-blue-600">
                            {getActionIcon(log.action)}
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-gray-900 break-words">
                                {log.action === "STAGE_CHANGE" && `Stage Changed: ${log.from} → ${log.to}`}
                                {log.action === "INTERVIEW_ASSIGNED" && "Interview Assigned"}
                                {log.action === "FEEDBACK_SUBMITTED" && "Feedback Submitted"}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                                by <span className="font-medium">{log.by}</span>
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0">
                              {new Date(log.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {log.action === "STAGE_CHANGE" && (
                            <div className="mt-2 md:mt-3 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded border ${STAGE_COLORS[log.from]}`}>
                                  {log.from}
                                </span>
                                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className={`text-xs px-2 py-1 rounded border ${STAGE_COLORS[log.to]}`}>
                                  {log.to}
                                </span>
                              </div>
                              {log.note && (
                                <div className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                                  <p className="text-xs md:text-sm text-gray-700 break-words">{log.note}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "interviews" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Interview History
                </h3>
                {interviews.length > 0 && (
                  <span className="text-xs md:text-sm text-gray-500">{interviews.length} interviews</span>
                )}
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm md:text-base text-gray-600">Loading interviews...</p>
                  </div>
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm md:text-base text-gray-600 font-medium">No interviews scheduled</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Interviews will appear here once scheduled</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                              {interview.interviewerId?.name || "Interviewer TBD"}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                              {interview.interviewerId?.email || "Not assigned yet"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 md:px-3 py-1 rounded-full font-medium shrink-0 ${
                          interview.status === "COMPLETED" 
                            ? "bg-green-100 text-green-700" 
                            : interview.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      
                      {interview.scheduledAt && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 md:p-3">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="break-words">
                            {new Date(interview.scheduledAt).toLocaleString('en-US', { 
                              weekday: 'short',
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
