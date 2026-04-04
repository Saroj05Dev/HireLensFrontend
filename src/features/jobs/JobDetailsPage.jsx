import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobs, closeJob, reopenJob, deleteJob } from "./jobsSlice";
import PipelineBoard from "./PipelineBoard";
import EditJob from "./EditJob";

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: jobs, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!jobs.length) {
      dispatch(fetchJobs());
    }
  }, [dispatch, jobs.length]);

  // Try to find job by id field (backend returns id, not _id)
  const job = jobs.find((job) => job.id === id);

  const handleToggleJobStatus = async () => {
    setShowCloseConfirm(true);
  };

  const confirmToggleStatus = async () => {
    const action = job.status === "OPEN" ? "close" : "reopen";
    
    setIsUpdating(true);
    setShowCloseConfirm(false);
    try {
      if (job.status === "OPEN") {
        await dispatch(closeJob(job.id)).unwrap();
      } else {
        await dispatch(reopenJob(job.id)).unwrap();
      }
    } catch (error) {
      alert(error || `Failed to ${action} job`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteJob = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      await dispatch(deleteJob(job.id)).unwrap();
      navigate("/jobs");
    } catch (error) {
      alert(error || "Failed to delete job");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-500 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const canManageJob = user?.role === "RECRUITER" || user?.role === "ADMIN";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-3 md:mb-4">
        <button
          onClick={() => navigate("/jobs")}
          className="text-xs md:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>
      </div>

      {/* Job Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 md:gap-4 w-full md:w-auto">
            {/* Job Avatar */}
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg md:text-2xl">
                {job.title.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{job.title}</h1>
                <span
                  className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full font-medium w-fit ${
                    job.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {/* Job Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-600">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.location}
                  </span>
                )}
                {job.experience && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {job.experience}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {job.candidateCount || 0} candidates
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canManageJob && (
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Job
              </button>
              <button
                onClick={handleToggleJobStatus}
                disabled={isUpdating || isDeleting}
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  job.status === "OPEN"
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isUpdating ? (
                  <>
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : job.status === "OPEN" ? (
                  <>
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close Job
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reopen Job
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={isUpdating || isDeleting}
                className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Delete Job</span>
                    <span className="sm:hidden">Delete</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Required Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {job.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="text-xs md:text-sm bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        {job.description && (
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Job Description</h3>
            <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{job.description}</p>
          </div>
        )}
      </div>

      {/* Pipeline Board */}
      <PipelineBoard jobTitle={job.title} />

      {/* Edit Job Modal */}
      {showEditModal && (
        <EditJob 
          job={job} 
          onClose={() => setShowEditModal(false)} 
        />
      )}

      {/* Close/Reopen Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                  job.status === "OPEN" ? "bg-gray-100" : "bg-green-100"
                }`}>
                  <svg className={`w-5 h-5 md:w-6 md:h-6 ${
                    job.status === "OPEN" ? "text-gray-600" : "text-green-600"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {job.status === "OPEN" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {job.status === "OPEN" ? "Close Job?" : "Reopen Job?"}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {job.status === "OPEN" 
                      ? "This job will no longer accept new applications" 
                      : "This job will start accepting applications again"}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to {job.status === "OPEN" ? "close" : "reopen"} <span className="font-medium">"{job.title}"</span>?
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleStatus}
                  className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                    job.status === "OPEN"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {job.status === "OPEN" ? "Close Job" : "Reopen Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Delete Job?</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to permanently delete <span className="font-medium">"{job.title}"</span>? All associated candidates and data will be removed.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
