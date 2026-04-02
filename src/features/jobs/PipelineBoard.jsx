import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCandidatesByJob, candidateStageUpdatedRealtime } from "../candidates/candidateSlice";
import { onCandidateStageUpdated, offSocketEvent } from "../../helpers/socket";
import CandidateCard from "../candidates/CandidateCard";
import AddCandidate from "../candidates/AddCandidate";
import CandidateProfile from "../candidates/CandidateProfile";

const STAGES = [
  { 
    key: "APPLIED", 
    label: "Applied", 
    color: "bg-blue-100 text-blue-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    key: "SCREENING", 
    label: "Screening", 
    color: "bg-purple-100 text-purple-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  { 
    key: "INTERVIEW", 
    label: "Interview", 
    color: "bg-amber-100 text-amber-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  { 
    key: "OFFER", 
    label: "Offer", 
    color: "bg-green-100 text-green-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    key: "HIRED", 
    label: "Hired", 
    color: "bg-emerald-100 text-emerald-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
];

const PipelineBoard = ({ jobTitle }) => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  
  const { candidatesByJob, jobCandidatesLoading } = useSelector((state) => state.candidates);
  const { user } = useSelector((state) => state.auth);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [stageFilter, setStageFilter] = useState("ALL");

  const candidates = candidatesByJob[jobId] || [];
  const loading = jobCandidatesLoading[jobId];

  useEffect(() => {
    if (jobId) {
      dispatch(getCandidatesByJob(jobId));
    }
  }, [dispatch, jobId]);

  // Set up real-time listeners
  useEffect(() => {
    const handleCandidateStageUpdate = (data) => {
      // Only update if it's for the current job
      if (data.jobId === jobId) {
        dispatch(candidateStageUpdatedRealtime(data));
      }
    };

    onCandidateStageUpdated(handleCandidateStageUpdate);

    return () => {
      offSocketEvent("candidate:stage-updated");
    };
  }, [dispatch, jobId]);

  const getCandidatesByStage = (stage) => {
    return candidates.filter(candidate => candidate.currentStage === stage);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const canManageCandidates = user?.role === "RECRUITER" || user?.role === "ADMIN";

  // Calculate stats
  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => 
    !["HIRED", "REJECTED"].includes(c.currentStage)
  ).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Pipeline Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Candidate Pipeline</h2>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-blue-600">{totalCandidates}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                <span className="text-gray-600">Active:</span>
                <span className="font-bold text-green-600">{activeCandidates}</span>
              </div>
            </div>
          </div>

          {canManageCandidates && (
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Candidate
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {totalCandidates === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates yet</h3>
          <p className="text-gray-500 mb-4">
            Start building your pipeline by adding candidates to this job.
          </p>
          {canManageCandidates && (
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Candidate
            </button>
          )}
        </div>
      ) : (
        /* Pipeline Columns */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {STAGES.map((stage) => {
              const stageCandidates = getCandidatesByStage(stage.key);
              
              return (
                <div
                  key={stage.key}
                  className="min-w-[280px] shrink-0"
                >
                  {/* Stage Header */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{stage.icon}</span>
                        <h3 className="text-sm font-semibold text-gray-900">{stage.label}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${stage.color}`}>
                        {stageCandidates.length}
                      </span>
                    </div>
                  </div>

                  {/* Candidates List */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {stageCandidates.length === 0 ? (
                      <div className="text-xs text-gray-400 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <svg
                          className="w-8 h-8 text-gray-300 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        No candidates
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          onViewProfile={handleViewProfile}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <AddCandidate
          jobId={jobId}
          onClose={() => setShowAddCandidate(false)}
        />
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default PipelineBoard;
