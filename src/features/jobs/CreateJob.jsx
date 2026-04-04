import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createJob } from "./jobsSlice";
import { useState } from "react";

const CreateJob = ({ onClose }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: data.title,
        description: data.description,
        experience: data.experience,
        location: data.location,
        skills: data.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await dispatch(createJob(payload)).unwrap();
      onClose();
    } catch (err) {
      setError(err || "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create New Job</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">Fill in the details to post a new job opening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 md:p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", { required: "Job title is required" })}
              placeholder="e.g. Senior Frontend Developer"
              className={`w-full border-2 ${
                errors.title ? "border-red-300" : "border-gray-300"
              } px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.title && (
              <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Job Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Required Skills
            </label>
            <input
              {...register("skills")}
              placeholder="React, Node.js, TypeScript, MongoDB"
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
          </div>

          {/* Experience and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Experience */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <select
                  {...register("experience")}
                  className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 pr-10 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1 years">0–1 years (Entry Level)</option>
                  <option value="1-3 years">1–3 years (Junior)</option>
                  <option value="3-5 years">3–5 years (Mid-Level)</option>
                  <option value="5-8 years">5–8 years (Senior)</option>
                  <option value="8+ years">8+ years (Lead/Principal)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
                Location
              </label>
              <input
                {...register("location")}
                placeholder="e.g. Remote, Bangalore, Hybrid"
                className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 md:px-5 py-2 md:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-sm text-sm md:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
