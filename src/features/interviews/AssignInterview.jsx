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
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const watchInterviewerId = watch("interviewerId");

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

  useEffect(() => {
    if (watchInterviewerId) {
      const interviewer = interviewers.find(i => i._id === watchInterviewerId);
      setSelectedInterviewer(interviewer);
    } else {
      setSelectedInterviewer(null);
    }
  }, [watchInterviewerId, interviewers]);

  const onSubmit = async (data) => {
    setError(null);
    
    const interviewData = {
      candidateId: candidate._id,
      interviewerId: data.interviewerId,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
    };

    const result = await dispatch(assignInterview(interviewData));
    
    if (assignInterview.fulfilled.match(result)) {
      onClose();
    } else if (assignInterview.rejected.match(result)) {
      setError(result.payload || "Failed to assign interview");
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

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assign Interview</h2>
                <p className="text-sm text-gray-600 mt-0.5">Schedule an interview for this candidate</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
              disabled={assignLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                {getInitials(candidate.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{candidate.name}</p>
                <p className="text-sm text-gray-600">{candidate.email}</p>
                {candidate.phone && (
                  <p className="text-sm text-gray-500">{candidate.phone}</p>
                )}
              </div>
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                {candidate.currentStage}
              </div>
            </div>
          </div>

          {(error || assignError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error || assignError}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Interviewer *
            </label>
            {loadingInterviewers ? (
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading interviewers...</p>
                </div>
              </div>
            ) : interviewers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">No interviewers available</p>
                <p className="text-xs text-gray-500 mt-1">Please add interviewers to your organization first</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  {...register("interviewerId", { required: "Please select an interviewer" })}
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Choose an interviewer...</option>
                  {interviewers.map((interviewer) => (
                    <option key={interviewer._id} value={interviewer._id}>
                      {interviewer.name} - {interviewer.email}
                    </option>
                  ))}
                </select>
                {errors.interviewerId && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.interviewerId.message}
                  </p>
                )}

                {selectedInterviewer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {getInitials(selectedInterviewer.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedInterviewer.name}</p>
                      <p className="text-sm text-gray-600">{selectedInterviewer.email}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Selected
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Schedule Date & Time
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                {...register("scheduledAt")}
                type="datetime-local"
                min={getMinDateTime()}
                className="w-full border-2 border-gray-300 pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Optional - You can schedule this later if needed
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Additional Notes
            </label>
            <textarea
              {...register("notes")}
              placeholder="Add any special instructions, topics to cover, or notes for the interviewer..."
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              These notes will be visible to the interviewer
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={assignLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={assignLoading || loadingInterviewers || interviewers.length === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            {assignLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Assign Interview
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignInterview;
