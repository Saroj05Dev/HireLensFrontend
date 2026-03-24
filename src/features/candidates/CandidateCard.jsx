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

const CandidateCard = ({ candidate, onViewProfile }) => {
  const dispatch = useDispatch();
  const { stageUpdateLoading } = useSelector((state) => state.candidates);
  const { user } = useSelector((state) => state.auth);
  
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAssignInterview, setShowAssignInterview] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [note, setNote] = useState("");

  const isUpdating = stageUpdateLoading[candidate._id];
  const canAssignInterview = user?.role === "RECRUITER" && candidate.currentStage === "SCREENING";

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

  return (
    <>
      <div className="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 
            className="font-medium text-sm cursor-pointer hover:text-blue-600"
            onClick={() => onViewProfile(candidate)}
          >
            {candidate.name}
          </h4>
          
          <div className="relative">
            <button
              onClick={() => setShowStageMenu(!showStageMenu)}
              disabled={isUpdating}
              className={`text-xs px-2 py-1 rounded ${STAGE_COLORS[candidate.currentStage]} hover:opacity-80 disabled:opacity-50`}
            >
              {isUpdating ? "..." : candidate.currentStage}
            </button>
            
            {showStageMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-10 min-w-32">
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

        <p className="text-xs text-gray-600 mb-1">{candidate.email}</p>
        
        {candidate.phone && (
          <p className="text-xs text-gray-500 mb-2">{candidate.phone}</p>
        )}

        {candidate.resumeUrl && (
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View Resume
          </a>
        )}

        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            Added {new Date(candidate.createdAt).toLocaleDateString()}
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

      {/* Assign Interview Modal */}
      {showAssignInterview && (
        <AssignInterview
          candidate={candidate}
          onClose={() => setShowAssignInterview(false)}
        />
      )}

      {/* Stage Update Modal */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-80">
            <h3 className="font-medium mb-3">
              Move {candidate.name} to {selectedStage}
            </h3>
            
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full border px-3 py-2 rounded text-sm"
              rows={3}
            />
            
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={cancelStageUpdate}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStageUpdate}
                disabled={isUpdating}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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