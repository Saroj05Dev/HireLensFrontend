import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "./jobsSlice";
import JobList from "./JobList";
import CreateJob from "./CreateJob";

const JobsPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...list];

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [list, statusFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const openJobs = list.filter((job) => job.status === "OPEN").length;
    const closedJobs = list.filter((job) => job.status === "CLOSED").length;
    const totalCandidates = list.reduce((sum, job) => sum + (job.candidateCount || 0), 0);

    return { openJobs, closedJobs, totalCandidates, totalJobs: list.length };
  }, [list]);

  const canCreateJob = user?.role === "RECRUITER" || user?.role === "ADMIN";

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Manage your job openings and track candidates</p>
          </div>

          {canCreateJob && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Job
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Total Jobs</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.totalJobs}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Open Positions</p>
                <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.openJobs}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Closed Jobs</p>
                <p className="text-xl md:text-2xl font-bold text-gray-600 mt-1">{stats.closedJobs}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Total Candidates</p>
                <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{stats.totalCandidates}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter and View Mode */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              {/* Status Filter */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Status:</span>
                <div className="flex gap-2">
                  {["ALL", "OPEN", "CLOSED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                        statusFilter === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 border-l pl-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || statusFilter !== "ALL") && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs md:text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {statusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("ALL")} className="hover:text-green-900">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="text-xs md:text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-3 md:mb-4 text-xs md:text-sm text-gray-600">
        Showing {filteredJobs.length} of {list.length} jobs
      </div>

      {/* Job List */}
      <JobList jobs={filteredJobs} loading={loading} viewMode={viewMode} />

      {/* Create Job Modal */}
      {showCreate && <CreateJob onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default JobsPage;
