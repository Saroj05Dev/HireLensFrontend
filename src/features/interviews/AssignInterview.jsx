import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { assignInterview } from "./interviewSlice";
import { getInterviewersApi } from "./interview.api";

const AssignInterview = ({ candidate, onClose }) => {
  const dispatch = useDispatch();
  const { assignLoading, error: assignError } = useSelector((state) => state.interviews);
  
  const [interviewers, setInterviewers] = useState([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch interviewers from the database
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        setLoadingInterviewers(true);
        const data = await getInterviewersApi();
        setInterviewers(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch interviewers:", err);
        setError("Failed to load interviewers. Please try again.");
      } finally {
        setLoadingInterviewers(false);
      }
    };

    fetchInterviewers();
  }, []);

  const onSubmit = async (data) => {
    setError(null); // Clear previous errors
    
    const interviewData = {
      candidateId: candidate._id,
      interviewerId: data.interviewerId,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
    };

    const result = await dispatch(assignInterview(interviewData));
    
    if (assignInterview.fulfilled.match(result)) {
      onClose();
    } else if (assignInterview.rejected.match(result)) {
      // Show the error from the backend
      setError(result.payload || "Failed to assign interview");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg w-[480px] space-y-4"
      >
        <h2 className="text-lg font-semibold">Assign Interview</h2>
        
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium">{candidate.name}</p>
          <p className="text-xs text-gray-600">{candidate.email}</p>
        </div>

        {/* Error Display */}
        {(error || assignError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error || assignError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Interviewer *
          </label>
          {loadingInterviewers ? (
            <div className="text-sm text-gray-500 py-2">Loading interviewers...</div>
          ) : interviewers.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">
              No interviewers available in your organization
            </div>
          ) : (
            <select
              {...register("interviewerId", { required: "Please select an interviewer" })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select interviewer</option>
              {interviewers.map((interviewer) => (
                <option key={interviewer._id} value={interviewer._id}>
                  {interviewer.name} ({interviewer.email})
                </option>
              ))}
            </select>
          )}
          {errors.interviewerId && (
            <p className="text-red-500 text-xs mt-1">{errors.interviewerId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled Date & Time
          </label>
          <input
            {...register("scheduledAt")}
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional - can be scheduled later
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            {...register("notes")}
            placeholder="Any special instructions or notes for the interviewer"
            className="w-full border px-3 py-2 rounded text-sm"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={assignLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={assignLoading || loadingInterviewers || interviewers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {assignLoading ? "Assigning..." : "Assign Interview"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignInterview;