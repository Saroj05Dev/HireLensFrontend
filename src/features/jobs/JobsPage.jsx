import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "./jobsSlice";
import JobList from "./JobList";
import CreateJob from "./CreateJob";

const JobsPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.jobs);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Job
        </button>
      </div>

      <JobList jobs={list} loading={loading} />

      {showCreate && <CreateJob onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default JobsPage;
