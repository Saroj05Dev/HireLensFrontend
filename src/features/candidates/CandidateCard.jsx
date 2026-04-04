import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCandidateStage } from "./candidateSlice";
import AssignInterview from "../interviews/AssignInterview";

const STAGES = [
  "APPLIED",
  "SCREENING", 
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED"
];

const STAGE_COLORS = {
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-yellow-100 text-yellow-700", 
  INTERVIEW: "bg-blue-100 text-blue-700",
  OFFER: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700"
};

const CandidateCard = ({ candidate, onViewProfile, isDraggable = false, showStageSelector = false, viewMode = "grid" }) => {
  const dispatch = useDispatch();
  const { stageUpdateLoading } = useSelector((state) => state.candidates);
  const { user } = useSelector((state) => state.auth);
  
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAssignInterview, setShowAssignInterview] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [note, setNote] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const stageMenuRef = useRef(null);

  const isUpdating = stageUpdateLoading[candidate._id];
  const canAssignInterview = user?.role === "RECRUITER" && candidate.currentStage === "SCREENING";
  
  // Enable stage selector if showStageSelector is true OR if not draggable
  const canChangeStage = showStageSelector || !isDraggable;

  // Close stage menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stageMenuRef.current && !stageMenuRef.current.contains(event.target)) {
        setShowStageMenu(false);
      }
    };

    if (showStageMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showStageMenu]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStageSelect = (stage) => {
    if (stage === candidate.currentStage) {
      setShowStageMenu(false);
      return;
    }
    
    setSelectedStage(stage);
    setShowStageMenu(false);
    setShowNoteInput(true);
  };

  const handleStageUpdate = async () => {
    await dispatch(updateCandidateStage({
      candidateId: candidate._id,
      newStage: selectedStage,
      note: note.trim()
    }));
    
    setShowNoteInput(false);
    setNote("");
    setSelectedStage("");
  };

  const cancelStageUpdate = () => {
    setShowNoteInput(false);
    setNote("");
    setSelectedStage("");
  };

  // Drag handlers
  const handleDragStart = (e) => {
    if (!isDraggable) return;
    
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("candidateId", candidate._id);
    e.dataTransfer.setData("currentStage", candidate.currentStage);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (viewMode === "list") {
    return (
      <>
        <div 
          draggable={isDraggable}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`bg-white p-3 md:p-4 rounded-lg border shadow-sm transition-all ${
            isDragging 
              ? "opacity-50 cursor-grabbing" 
              : isDraggable 
                ? "hover:shadow-md cursor-grab" 
                : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2 md:gap-4">
            {isDraggable && (
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}

            <div 
              onClick={() => onViewProfile(candidate)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm md:text-base font-bold shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              {getInitials(candidate.name)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 
                className="text-sm md:text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                onClick={() => onViewProfile(candidate)}
              >
                {candidate.name}
              </h4>
              <p className="text-xs md:text-sm text-gray-600 truncate">{candidate.email}</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div className="relative" ref={stageMenuRef}>
                <button
                  onClick={() => canChangeStage && setShowStageMenu(!showStageMenu)}
                  disabled={isUpdating || !canChangeStage}
                  className={`text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full font-medium ${STAGE_COLORS[candidate.currentStage]} ${
                    canChangeStage ? "hover:opacity-80 cursor-pointer" : "cursor-default"
                  } disabled:opacity-50`}
                >
                  {isUpdating ? "..." : candidate.currentStage}
                </button>
                
                {showStageMenu && canChangeStage && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-36 max-h-60 overflow-y-auto">
                    {STAGES.map((stage) => (
                      <button
                        key={stage}
                        onClick={() => handleStageSelect(stage)}
                        className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                          stage === candidate.currentStage ? "bg-gray-100 font-medium" : ""
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="View Resume"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              )}

              {canAssignInterview && (
                <button
                  onClick={() => setShowAssignInterview(true)}
                  className="hidden sm:inline-flex text-xs bg-green-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-green-700 font-medium whitespace-nowrap"
                >
                  Assign Interview
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile action button row */}
          {canAssignInterview && (
            <div className="mt-2 sm:hidden">
              <button
                onClick={() => setShowAssignInterview(true)}
                className="w-full text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
              >
                Assign Interview
              </button>
            </div>
          )}
        </div>

        {showAssignInterview && (
          <AssignInterview
            candidate={candidate}
            onClose={() => setShowAssignInterview(false)}
          />
        )}

        {showNoteInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md shadow-xl">
              <h3 className="font-semibold text-base md:text-lg mb-3">
                Move {candidate.name} to {selectedStage}
              </h3>
              
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
                <button
                  onClick={cancelStageUpdate}
                  className="px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStageUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Stage"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div 
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-white p-4 md:p-5 rounded-xl border-2 border-gray-200 shadow-sm transition-all hover:shadow-lg hover:border-blue-300 ${
          isDragging 
            ? "opacity-50 cursor-grabbing scale-95" 
            : isDraggable 
              ? "cursor-grab" 
              : ""
        }`}
      >
        {/* Header with Avatar and Stage */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isDraggable && (
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}
            <div className="relative">
              <div 
                onClick={() => onViewProfile(candidate)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base md:text-lg font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                {getInitials(candidate.name)}
              </div>
            </div>
          </div>
          
          <div className="relative shrink-0" ref={stageMenuRef}>
            <button
              onClick={() => canChangeStage && setShowStageMenu(!showStageMenu)}
              disabled={isUpdating || !canChangeStage}
              className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${STAGE_COLORS[candidate.currentStage]} ${
                canChangeStage ? "hover:opacity-80 cursor-pointer hover:shadow-md" : "cursor-default"
              } disabled:opacity-50 transition-all`}
            >
              {isUpdating ? "..." : candidate.currentStage}
            </button>
            
            {showStageMenu && canChangeStage && (
              <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 min-w-36 max-h-60 overflow-y-auto">
                {STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => handleStageSelect(stage)}
                    className={`block w-full text-left px-3 py-2.5 text-xs hover:bg-blue-50 transition-colors ${
                      stage === candidate.currentStage ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Candidate Info */}
        <div className="mb-4">
          <h4 
            className="font-bold text-base md:text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors mb-1 truncate"
            onClick={() => onViewProfile(candidate)}
          >
            {candidate.name}
          </h4>
          <p className="text-xs md:text-sm text-gray-600 truncate flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {candidate.email}
          </p>
          
          {candidate.phone && (
            <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {candidate.phone}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(candidate.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-2">
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Resume"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            )}
            
            {canAssignInterview && (
              <button
                onClick={() => setShowAssignInterview(true)}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all hover:shadow-md"
              >
                Assign Interview
              </button>
            )}
          </div>
        </div>
      </div>

      {showAssignInterview && (
        <AssignInterview
          candidate={candidate}
          onClose={() => setShowAssignInterview(false)}
        />
      )}

      {showNoteInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-base md:text-lg mb-3">
              Move {candidate.name} to {selectedStage}
            </h3>
            
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={cancelStageUpdate}
                className="px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStageUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Stage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateCard;