import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCandidates } from "./candidateSlice";
import { fetchJobs } from "../jobs/jobsSlice";
import CandidateCard from "./CandidateCard";
import CandidateProfile from "./CandidateProfile";

const STAGE_FILTERS = [
  { key: "", label: "All Stages", color: "bg-gray-100 text-gray-700" },
  { key: "APPLIED", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { key: "SCREENING", label: "Screening", color: "bg-yellow-100 text-yellow-700" },
  { key: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-700" },
  { key: "OFFER", label: "Offer", color: "bg-indigo-100 text-indigo-700" },
  { key: "HIRED", label: "Hired", color: "bg-green-100 text-green-700" },
  { key: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-700" },
];

const CandidateContainer = () => {
  const dispatch = useDispatch();
  const { list: candidates, loading, error } = useSelector((state) => state.candidates);
  const { list: jobs } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    stage: "",
    jobId: "",
  });

  useEffect(() => {
    dispatch(getAllCandidates(filters));
    dispatch(fetchJobs());
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStageCount = (stage) => {
    if (!stage) return candidates.length;
    return candidates.filter(c => c.currentStage === stage).length;
  };

  const canManageCandidates = user?.role === "RECRUITER" || user?.role === "ADMIN";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              All Candidates
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track all candidates across your organization
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold border border-blue-200">
              {filteredCandidates.length} Total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {STAGE_FILTERS.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleFilterChange("stage", stage.key)}
              className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                filters.stage === stage.key
                  ? `${stage.color} border-current shadow-md scale-105`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{getStageCount(stage.key)}</div>
                <div className="text-xs mt-1">{stage.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.jobId}
              onChange={(e) => handleFilterChange("jobId", e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id || job._id} value={job.id || job._id}>
                  {job.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {(filters.stage || filters.jobId || searchQuery) && (
              <button
                onClick={() => {
                  setFilters({ stage: "", jobId: "" });
                  setSearchQuery("");
                }}
                className="px-4 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {(filters.stage || filters.jobId || searchQuery) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.stage && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Stage: {STAGE_FILTERS.find(s => s.key === filters.stage)?.label}
                <button
                  onClick={() => handleFilterChange("stage", "")}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.jobId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Job: {jobs.find(j => (j.id || j._id) === filters.jobId)?.title}
                <button
                  onClick={() => handleFilterChange("jobId", "")}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500 mb-4">
              {filters.stage || filters.jobId || searchQuery
                ? "Try adjusting your filters or search query"
                : "Candidates will appear here once they're added to jobs"
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3"
          }>
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onViewProfile={handleViewProfile}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default CandidateContainer;
