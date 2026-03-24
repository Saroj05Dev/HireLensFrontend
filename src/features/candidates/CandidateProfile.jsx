import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getCandidateDecisionLogsApi, getCandidateInterviewsApi } from "./candidate.api";

const STAGE_COLORS = {
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-yellow-100 text-yellow-700", 
  INTERVIEW: "bg-blue-100 text-blue-700",
  OFFER: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700"
};

const CandidateProfile = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [decisionLogs, setDecisionLogs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.email}</p>
              {candidate.phone && (
                <p className="text-gray-600">{candidate.phone}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded ${STAGE_COLORS[candidate.currentStage]}`}>
                {candidate.currentStage}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:underline text-sm"
            >
              View Resume →
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {[
              { key: "overview", label: "Overview" },
              { key: "timeline", label: "Timeline" },
              { key: "interviews", label: "Interviews" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p>{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p>{candidate.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Current Stage:</span>
                    <p>{candidate.currentStage}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Applied:</span>
                    <p>{new Date(candidate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div>
              <h3 className="font-medium mb-3">Decision Timeline</h3>
              {loading ? (
                <p className="text-gray-500">Loading timeline...</p>
              ) : decisionLogs.length === 0 ? (
                <p className="text-gray-500">No timeline events yet.</p>
              ) : (
                <div className="space-y-3">
                  {decisionLogs.map((log, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {log.action === "STAGE_CHANGE" && `Moved from ${log.from} to ${log.to}`}
                            {log.action === "INTERVIEW_ASSIGNED" && "Interview assigned"}
                            {log.action === "FEEDBACK_SUBMITTED" && "Feedback submitted"}
                          </p>
                          <p className="text-xs text-gray-500">by {log.by}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "interviews" && (
            <div>
              <h3 className="font-medium mb-3">Interviews</h3>
              {loading ? (
                <p className="text-gray-500">Loading interviews...</p>
              ) : interviews.length === 0 ? (
                <p className="text-gray-500">No interviews scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            Interview with {interview.interviewerId?.name || "TBD"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: {interview.status}
                          </p>
                          {interview.scheduledAt && (
                            <p className="text-xs text-gray-500">
                              Scheduled: {new Date(interview.scheduledAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
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