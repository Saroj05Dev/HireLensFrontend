import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCandidatesByJob, candidateStageUpdatedRealtime } from "../candidates/candidateSlice";
import { onCandidateStageUpdated, offSocketEvent } from "../../helpers/socket";
import CandidateCard from "../candidates/CandidateCard";
import AddCandidate from "../candidates/AddCandidate";
import CandidateProfile from "../candidates/CandidateProfile";

const STAGES = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENING", label: "Screening" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
];

const PipelineBoard = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  
  const { candidatesByJob, jobCandidatesLoading } = useSelector((state) => state.candidates);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  if (loading) {
    return (
      <div>
        <h2 className="font-semibold mb-4">Candidate Pipeline</h2>
        <p className="text-gray-500">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Candidate Pipeline</h2>
        <button
          onClick={() => setShowAddCandidate(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          + Add Candidate
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.key);
          
          return (
            <div
              key={stage.key}
              className="min-w-64 bg-gray-50 rounded-lg p-3"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stageCandidates.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-4">
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
