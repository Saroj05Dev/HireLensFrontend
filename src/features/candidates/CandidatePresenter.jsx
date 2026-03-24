import CandidateCard from "./CandidateCard";
import CandidateProfile from "./CandidateProfile";

const CandidatePresenter = ({ 
  candidates, 
  loading, 
  error, 
  selectedCandidate, 
  onViewProfile, 
  onCloseProfile 
}) => {
  if (loading) {
    return <p className="text-gray-500">Loading candidates...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No candidates found</p>
        <p className="text-sm text-gray-400">
          Candidates will appear here once they're added to jobs
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate._id}
            candidate={candidate}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          onClose={onCloseProfile}
        />
      )}
    </>
  );
};

export default CandidatePresenter;