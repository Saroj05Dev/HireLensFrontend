import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllCandidates } from '../../features/candidates/candidateSlice';
import { fetchJobs } from '../../features/jobs/jobsSlice';

const SearchBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: candidates } = useSelector((state) => state.candidates);
  const { list: jobs } = useSelector((state) => state.jobs);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ candidates: [], jobs: [] });
  
  const searchRef = useRef(null);

  // Load data for search
  useEffect(() => {
    if (candidates.length === 0) {
      dispatch(getAllCandidates({}));
    }
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    }
  }, [dispatch, candidates.length, jobs.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ candidates: [], jobs: [] });
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    const filteredCandidates = candidates
      .filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const filteredJobs = jobs
      .filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.description?.toLowerCase().includes(query) ||
        j.skills?.some(s => s.toLowerCase().includes(query))
      )
      .slice(0, 5);

    setSearchResults({ candidates: filteredCandidates, jobs: filteredJobs });
    setShowSearchResults(true);
  }, [searchQuery, candidates, jobs]);

  const handleSearchResultClick = (type, id) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    if (type === 'candidate') {
      navigate('/candidates');
    } else if (type === 'job') {
      navigate(`/jobs/${id}`);
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalResults = searchResults.candidates.length + searchResults.jobs.length;

  return (
    <div className="relative w-full" ref={searchRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
        placeholder="Search candidates, jobs..."
        className="w-full bg-slate-600 text-slate-100 placeholder-slate-300 border border-slate-500 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all md:bg-slate-700"
      />
      <svg className="w-5 h-5 text-slate-300 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

          {/* Search Results Dropdown */}
          {showSearchResults && totalResults > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
              {/* Candidates Section */}
              {searchResults.candidates.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Candidates ({searchResults.candidates.length})
                  </div>
                  {searchResults.candidates.map((candidate) => (
                    <button
                      key={candidate._id}
                      onClick={() => handleSearchResultClick('candidate', candidate._id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {getInitials(candidate.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{candidate.name}</div>
                        <div className="text-xs text-gray-500 truncate">{candidate.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        candidate.currentStage === 'HIRED' ? 'bg-green-100 text-green-700' :
                        candidate.currentStage === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {candidate.currentStage}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Jobs Section */}
              {searchResults.jobs.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jobs ({searchResults.jobs.length})
                  </div>
                  {searchResults.jobs.map((job) => (
                    <button
                      key={job.id || job._id}
                      onClick={() => handleSearchResultClick('job', job.id || job._id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {job.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{job.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {job.location || 'Remote'} • {job.candidateCount || 0} candidates
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {job.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {showSearchResults && searchQuery.length >= 2 && totalResults === 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
            </div>
          )}
    </div>
  );
};

export default SearchBar;
