import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCandidates } from "./candidateSlice";
import Layout from "../../components/layouts/Layout";
import CandidateCard from "./CandidateCard";
import CandidateProfile from "./CandidateProfile";

const STAGE_FILTERS = [
  { key: "", label: "All Stages" },
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENING", label: "Screening" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

const CandidateContainer = () => {
  const dispatch = useDispatch();
  const { list: candidates, loading, error } = useSelector((state) => state.candidates);
  const { list: jobs } = useSelector((state) => state.jobs);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    stage: "",
    jobId: "",
  });

  useEffect(() => {
    dispatch(getAllCandidates(filters));
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

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Candidates</h1>
          <p className="text-gray-500">Loading candidates...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <div className="text-sm text-gray-500">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded border mb-6">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange("stage", e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                {STAGE_FILTERS.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Job</label>
              <select
                value={filters.jobId}
                onChange={(e) => handleFilterChange("jobId", e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {(filters.stage || filters.jobId) && (
              <button
                onClick={() => setFilters({ stage: "", jobId: "" })}
                className="text-sm text-blue-600 hover:underline mt-4"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Candidates Grid */}
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No candidates found</p>
            <p className="text-sm text-gray-400">
              {filters.stage || filters.jobId 
                ? "Try adjusting your filters" 
                : "Candidates will appear here once they're added to jobs"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        )}

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <CandidateProfile
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default CandidateContainer;