import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "./jobsSlice";
import Layout from "../../components/layouts/Layout";
import JobList from "./JobList";
import CreateJob from "./CreateJob";


const JobsPage = () => {

    const dispatch = useDispatch();
    const { list, loading } = useSelector((state) => state.jobs);
    const [ showCreate, setShowCreate ] = useState(false);

    useEffect(() => {
        dispatch(fetchJobs());
    }, [dispatch]);

  return (
    <Layout>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Jobs</h1>

            <button
                onClick={() => setShowCreate(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                + Create Job
            </button>
        </div>

        <JobList jobs={list} loading={loading} />

        {showCreate && <CreateJob onClose={() => setShowCreate(false)} />}
    </Layout>
  )
}

export default JobsPage
