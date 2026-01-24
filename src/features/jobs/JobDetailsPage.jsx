import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../../components/layouts/Layout";
import PipelineBoard from "./PipelineBoard";

const JobDetailsPage = () => {
  const { id } = useParams();

  const job = useSelector((state) =>
    state.jobs.list.find((job) => job.id === id),
  );

  if (!job) {
    return (
      <Layout>
        <p className="text-gray-500">Job not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Job Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-gray-600 mt-1">
          {job.location} • {job.experience}
        </p>

        {job.skills?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
                {job.skills.map((skill) => (
                    <span 
                        key={skill} 
                        className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {skill}
                    </span>
                ))}
            </div>
        )}
      </div>

      {  /* Job Description */}
      <div className="bg-white p-4 rounded border mb-6">
            <h2 className="font-semibold mb-2">Job Description</h2>
            <p className="text-gray-700 text-sm">{job.description}</p>
      </div>

      {  /* Pipeline */}
      <PipelineBoard />
    </Layout>
  );
};

export default JobDetailsPage;
