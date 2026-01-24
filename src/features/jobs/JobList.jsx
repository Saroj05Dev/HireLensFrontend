import { Link } from "react-router-dom";

const JobList = ({ jobs, loading }) => {
  if (loading) return <p>Loading jobs...</p>;

  if (!jobs.length) {
    return <p className="text-gray-500">No jobs created yet.</p>;
  }

  return (
    <div className="bg-white rounded border divide-y">
      {jobs.map((job) => (
        <Link
          to={`/jobs/${job.id}`}
          key={job.id}
          className="block p-4 hover:bg-gray-50"
        >
          <div className="flex justify-between items-start">
            {/* Left */}
            <div>
              <h3 className="font-semibold text-lg">
                {job.title}
              </h3>

              <p className="text-sm text-gray-600">
                {job.location} • {job.experience}
              </p>

              {job.skills?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {job.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}

                  {job.skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right */}
            <span
              className={`text-xs px-2 py-1 rounded ${
                job.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {job.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default JobList;
