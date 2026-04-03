import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { getAllCandidates } from '../../features/candidates/candidateSlice';
import { fetchJobs } from '../../features/jobs/jobsSlice';
import { getUnreadCount, selectUnreadCount } from '../../features/notifications/notificationSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { list: candidates } = useSelector((state) => state.candidates);
  const { list: jobs } = useSelector((state) => state.jobs);
  const unreadCount = useSelector(selectUnreadCount);
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ candidates: [], jobs: [] });
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Load data for search
  useEffect(() => {
    if (candidates.length === 0) {
      dispatch(getAllCandidates({}));
    }
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    }
    // Fetch unread notification count
    dispatch(getUnreadCount());
  }, [dispatch, candidates.length, jobs.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'RECRUITER':
        return 'bg-blue-100 text-blue-700';
      case 'INTERVIEWER':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalResults = searchResults.candidates.length + searchResults.jobs.length;

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shadow-sm">
      {/* Left - Logo & Org */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HL</span>
          </div>
          <span className="font-semibold text-xl text-white">HireLens</span>
        </div>
        
        {/* Organization Name */}
        {user?.organizationName && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg border border-slate-600">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-slate-200">{user.organizationName}</span>
          </div>
        )}
      </div>

      {/* Center - Search */}
      <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            placeholder="Search candidates, jobs..."
            className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {/* Right - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {getInitials(user?.name)}
              </span>
            </div>
            
            {/* User Name Only */}
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-white">{user?.name}</div>
            </div>

            {/* Dropdown Icon */}
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{user?.email}</div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>

              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
