import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { updateJob } from "./jobsSlice";
import { useState } from "react";

const EditJob = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: job.title,
      description: job.description,
      skills: job.skills.join(", "),
      experience: job.experience,
      location: job.location,
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    const jobData = {
      ...data,
      skills: data.skills.split(",").map(skill => skill.trim()).filter(Boolean)
    };

    try {
      await dispatch(updateJob({ jobId: job.id, jobData })).unwrap();
      onClose();
    } catch (error) {
      alert(error || "Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Edit Job</h2>
                <p className="text-xs md:text-sm text-gray-600">Update job details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 md:p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Job Title */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Job Title *
            </label>
            <input
              {...register("title", { required: "Job title is required" })}
              type="text"
              placeholder="e.g., Senior Frontend Developer"
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Description */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Job Description *
            </label>
            <textarea
              {...register("description", { required: "Job description is required" })}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={5}
            />
            {errors.description && (
              <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Required Skills *
            </label>
            <input
              {...register("skills", { required: "Skills are required" })}
              type="text"
              placeholder="e.g., React, JavaScript, TypeScript, CSS"
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs md:text-sm text-gray-500 mt-1">Separate skills with commas</p>
            {errors.skills && (
              <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.skills.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Experience Required *
            </label>
            <input
              {...register("experience", { required: "Experience is required" })}
              type="text"
              placeholder="e.g., 3-5 years"
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.experience && (
              <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2">
              Location *
            </label>
            <input
              {...register("location", { required: "Location is required" })}
              type="text"
              placeholder="e.g., Bangalore, Mumbai, or Remote"
              className="w-full border-2 border-gray-300 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.location && (
              <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.location.message}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 md:px-5 py-2 md:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-sm text-sm md:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
