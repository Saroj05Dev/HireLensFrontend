import { useState } from "react";
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

const CandidateCard = ({ candidate, onViewProfile, isDraggable = false, viewMode = "grid" }) => {
  const dispatch = useDispatch();
  const { stageUpdateLoading } = useSelector((state) => state.candidates);
  const { user } = useSelector((state) => state.auth);
  
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAssignInterview, setShowAssignInterview] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [note, setNote] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const isUpdating = stageUpdateLoading[candidate._id];
  const canAssignInterview = user?.role === "RECRUITER" && candidate.currentStage === "SCREENING";

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
          className={`bg-white p-4 rounded-lg border shadow-sm transition-all flex items-center gap-4 ${
            isDragging 
              ? "opacity-50 cursor-grabbing" 
              : isDraggable 
                ? "hover:shadow-md cursor-grab" 
                : "hover:shadow-md"
          }`}
        >
          {isDraggable && (
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}

          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
            {getInitials(candidate.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h4 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 truncate"
              onClick={() => onViewProfile(candidate)}
            >
              {candidate.name}
            </h4>
            <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {candidate.phone && (
              <div className="text-sm text-gray-600 hidden lg:block">
                {candidate.phone}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => !isDraggable && setShowStageMenu(!showStageMenu)}
                disabled={isUpdating || isDraggable}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${STAGE_COLORS[candidate.currentStage]} ${
                  isDraggable ? "cursor-default" : "hover:opacity-80"
                } disabled:opacity-50`}
              >
                {isUpdating ? "..." : candidate.currentStage}
              </button>
              
              {showStageMenu && !isDraggable && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-36">
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

            <div className="text-xs text-gray-500 hidden md:block">
              {new Date(candidate.createdAt).toLocaleDateString()}
            </div>

            {canAssignInterview && (
              <button
                onClick={() => setShowAssignInterview(true)}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
              >
                Assign Interview
              </button>
            )}

            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
                title="View Resume"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {showAssignInterview && (
          <AssignInterview
            candidate={candidate}
            onClose={() => setShowAssignInterview(false)}
          />
        )}

        {showNoteInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="font-semibold text-lg mb-3">
                Move {candidate.name} to {selectedStage}
              </h3>
              
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={cancelStageUpdate}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStageUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        className={`bg-white p-4 rounded-lg border shadow-sm transition-all ${
          isDragging 
            ? "opacity-50 cursor-grabbing" 
            : isDraggable 
              ? "hover:shadow-md cursor-grab" 
              : "hover:shadow-md"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isDraggable && (
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(candidate.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 
                className="font-semibold text-sm cursor-pointer hover:text-blue-600 truncate"
                onClick={() => onViewProfile(candidate)}
              >
                {candidate.name}
              </h4>
            </div>
          </div>
          
          <div className="relative shrink-0 ml-2">
            <button
              onClick={() => !isDraggable && setShowStageMenu(!showStageMenu)}
              disabled={isUpdating || isDraggable}
              className={`text-xs px-2 py-1 rounded-full font-medium ${STAGE_COLORS[candidate.currentStage]} ${
                isDraggable ? "cursor-default" : "hover:opacity-80"
              } disabled:opacity-50`}
            >
              {isUpdating ? "..." : candidate.currentStage}
            </button>
            
            {showStageMenu && !isDraggable && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-32">
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
        </div>

        <p className="text-xs text-gray-600 mb-1 truncate">{candidate.email}</p>
        
        {candidate.phone && (
          <p className="text-xs text-gray-500 mb-2">{candidate.phone}</p>
        )}

        {candidate.resumeUrl && (
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline block mb-2"
          >
            View Resume
          </a>
        )}

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {new Date(candidate.createdAt).toLocaleDateString()}
          </p>
          
          {canAssignInterview && (
            <button
              onClick={() => setShowAssignInterview(true)}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Assign Interview
            </button>
          )}
        </div>
      </div>

      {showAssignInterview && (
        <AssignInterview
          candidate={candidate}
          onClose={() => setShowAssignInterview(false)}
        />
      )}

      {showNoteInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h3 className="font-semibold text-lg mb-3">
              Move {candidate.name} to {selectedStage}
            </h3>
            
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelStageUpdate}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStageUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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