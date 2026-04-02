import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobs, closeJob, reopenJob } from "./jobsSlice";
import PipelineBoard from "./PipelineBoard";

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: jobs, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!jobs.length) {
      dispatch(fetchJobs());
    }
  }, [dispatch, jobs.length]);

  // Try to find job by id field (backend returns id, not _id)
  const job = jobs.find((job) => job.id === id);

  const handleToggleJobStatus = async () => {
    const action = job.status === "OPEN" ? "close" : "reopen";
    
    if (window.confirm(`Are you sure you want to ${action} this job?`)) {
      setIsUpdating(true);
      try {
        if (job.status === "OPEN") {
          await dispatch(closeJob(job.id)).unwrap();
        } else {
          await dispatch(reopenJob(job.id)).unwrap();
        }
        // Job will be updated in Redux store automatically
      } catch (error) {
        alert(error || `Failed to ${action} job`);
      } finally {
        setIsUpdating(false);
      }
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
      <div className="mb-4">
        <button
          onClick={() => navigate("/jobs")}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>
      </div>

      {/* Job Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Job Avatar */}
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-2xl">
                {job.title.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Job Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    job.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {/* Job Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  alert("Edit job functionality will be implemented in the next phase. For now, you can create a new job with updated details.");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Job
              </button>
              <button
                onClick={handleToggleJobStatus}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  job.status === "OPEN"
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : job.status === "OPEN" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close Job
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reopen Job
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {job.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
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
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
          </div>
        )}
      </div>

      {/* Pipeline Board */}
      <PipelineBoard jobTitle={job.title} />
    </div>
  );
};

export default JobDetailsPage;
