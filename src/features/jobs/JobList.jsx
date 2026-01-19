const JobList = ({ jobs, loading }) => {

    if(loading) return <p>Loading jobs...</p>

    if(!jobs.length) {
        return <p className="text-gray-500">No jobs created yet.</p>
    }

  return (
    <div className="bg-white rounded border">
      {jobs.map((job) => (
        <div
            key={job.id}
            className="p-4 border-b last:border-none"
        >
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-600">
                {job.status}
            </p>
        </div>
      ))}
    </div>
  )
}

export default JobList
