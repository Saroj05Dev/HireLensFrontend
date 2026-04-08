import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCandidatesByJob, candidateStageUpdatedRealtime, updateCandidateStage } from "../candidates/candidateSlice";
import { onCandidateStageUpdated, offSocketEvent } from "../../helpers/socket";
import CandidateCard from "../candidates/CandidateCard";
import AddCandidate from "../candidates/AddCandidate";
import CandidateProfile from "../candidates/CandidateProfile";
import { toast } from "../../components/ui/Toast";
import Loader from "../../components/ui/Loader";

// Linear stage order — must advance exactly one step at a time
const STAGE_ORDER = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

const getNextValidStages = (currentStage) => {
  if (currentStage === "HIRED" || currentStage === "REJECTED") return [];
  const idx = STAGE_ORDER.indexOf(currentStage);
  const next = idx >= 0 && idx < STAGE_ORDER.length - 1 ? [STAGE_ORDER[idx + 1]] : [];
  return [...next, "REJECTED"];
};

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
  { 
    key: "REJECTED", 
    label: "Rejected", 
    color: "bg-red-100 text-red-700",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
  const [dragOverStage, setDragOverStage] = useState(null);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [showDropConfirm, setShowDropConfirm] = useState(false);
  const [dropNote, setDropNote] = useState("");
  const [dropError, setDropError] = useState("");

  const candidates = candidatesByJob[jobId] || [];
  const loading = jobCandidatesLoading[jobId];
  
  // Detect if user is on mobile (screen width < 768px)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check if user can drag candidates (only RECRUITER and not on mobile)
  const canDragCandidates = user?.role === "RECRUITER" && !isMobile;
  
  // Check if user can manage candidates (RECRUITER on any device)
  const canManageCandidatesAnyDevice = user?.role === "RECRUITER";

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

  // Drag and drop handlers
  const handleDragOver = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const handleDragEnter = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    
    const candidateId = e.dataTransfer.getData("candidateId");
    const currentStage = e.dataTransfer.getData("currentStage");
    
    setDragOverStage(null);
    
    // Don't update if dropping in the same stage
    if (currentStage === newStage) return;
    
    // Find the candidate
    const candidate = candidates.find(c => c._id === candidateId);
    if (!candidate) return;

    // Validate the transition before showing modal
    const validNext = getNextValidStages(currentStage);
    if (!validNext.includes(newStage)) {
      if (currentStage === "HIRED") {
        toast.warning(`${candidate.name} is hired — this is a final state and cannot be changed.`);
      } else if (currentStage === "REJECTED") {
        toast.warning(`${candidate.name} is rejected. Use the 'Reopen' button to re-evaluate them.`);
      } else {
        const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(currentStage) + 1];
        toast.error(`Cannot skip stages. The next valid stage after ${currentStage} is ${nextStage || "REJECTED"}.`);
      }
      return;
    }
    
    // Valid drop — show confirmation modal
    setDropError("");
    setDraggedCandidate({ ...candidate, newStage });
    setShowDropConfirm(true);
  };

  const handleConfirmDrop = async () => {
    if (!draggedCandidate) return;
    setDropError("");
    
    const result = await dispatch(updateCandidateStage({
      candidateId: draggedCandidate._id,
      newStage: draggedCandidate.newStage,
      note: dropNote.trim()
    }));

    if (updateCandidateStage.rejected.match(result)) {
      setDropError(result.payload || "Failed to update stage.");
      return;
    }
    
    setShowDropConfirm(false);
    setDraggedCandidate(null);
    setDropNote("");
    setDropError("");
  };

  const handleCancelDrop = () => {
    setShowDropConfirm(false);
    setDraggedCandidate(null);
    setDropNote("");
    setDropError("");
  };

  // Calculate stats
  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => 
    !["HIRED", "REJECTED"].includes(c.currentStage)
  ).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-center">
          <Loader text="Loading pipeline..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Pipeline Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-4 mb-3 md:mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Candidate Pipeline</h2>
              <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click on avatar or name to view candidate profile
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-blue-600">{totalCandidates}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-green-50 rounded-lg">
                <span className="text-gray-600">Active:</span>
                <span className="font-bold text-green-600">{activeCandidates}</span>
              </div>
            </div>
          </div>

          {canManageCandidates && (
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm w-full sm:w-auto"
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-12 text-center">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4"
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
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No candidates yet</h3>
          <p className="text-sm md:text-base text-gray-500 mb-4">
            Start building your pipeline by adding candidates to this job.
          </p>
          {canManageCandidates && (
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Candidate
            </button>
          )}
        </div>
      ) : (
        /* Pipeline Columns */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 md:p-4">
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2">
            {STAGES.map((stage) => {
              const stageCandidates = getCandidatesByStage(stage.key);
              const isDropZone = dragOverStage === stage.key;
              
              return (
                <div
                  key={stage.key}
                  className="min-w-[240px] md:min-w-[280px] shrink-0"
                >
                  {/* Stage Header */}
                  <div className="bg-gray-50 rounded-lg p-2 md:p-3 mb-2 md:mb-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="text-gray-600 scale-90 md:scale-100">{stage.icon}</span>
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900">{stage.label}</h3>
                      </div>
                      <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full font-medium ${stage.color}`}>
                        {stageCandidates.length}
                      </span>
                    </div>
                  </div>

                  {/* Candidates List - Drop Zone */}
                  <div 
                    className={`space-y-2 md:space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1 rounded-lg transition-all ${
                      isDropZone && canDragCandidates
                        ? "bg-blue-50 border-2 border-blue-400 border-dashed p-1 md:p-2" 
                        : "border-2 border-transparent p-1 md:p-2"
                    }`}
                    onDragOver={(e) => canDragCandidates && handleDragOver(e, stage.key)}
                    onDragEnter={(e) => canDragCandidates && handleDragEnter(e, stage.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => canDragCandidates && handleDrop(e, stage.key)}
                  >
                    {stageCandidates.length === 0 ? (
                      <div className={`text-xs text-gray-400 text-center py-6 md:py-8 rounded-lg border-2 border-dashed ${
                        isDropZone && canDragCandidates ? "border-blue-400 bg-blue-100" : "border-gray-200 bg-gray-50"
                      }`}>
                        <svg
                          className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                            isDropZone && canDragCandidates ? "text-blue-400" : "text-gray-300"
                          }`}
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
                        {isDropZone && canDragCandidates ? "Drop here" : "No candidates"}
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          candidate={candidate}
                          onViewProfile={handleViewProfile}
                          isDraggable={canDragCandidates}
                          showStageSelector={canManageCandidatesAnyDevice}
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

      {/* Drop Confirmation Modal */}
      {showDropConfirm && draggedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-base md:text-lg mb-1">
              Move {draggedCandidate.name} to{" "}
              <span className={draggedCandidate.newStage === "REJECTED" ? "text-red-600" : "text-blue-600"}>
                {draggedCandidate.newStage}
              </span>?
            </h3>
            
            <p className="text-xs md:text-sm text-gray-600 mb-4">
              From: <span className="font-medium">{draggedCandidate.currentStage}</span>
            </p>

            {dropError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">
                {dropError}
              </div>
            )}
            
            <textarea
              value={dropNote}
              onChange={(e) => setDropNote(e.target.value)}
              placeholder="Add a note about this stage change (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={handleCancelDrop}
                className="px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDrop}
                className={`px-4 py-2 text-xs md:text-sm text-white rounded-lg transition-colors ${
                  draggedCandidate.newStage === "REJECTED" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;
