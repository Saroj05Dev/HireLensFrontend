import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./candidateSlice";
import { parseResumeApi } from "./candidate.api";

const AddCandidate = ({ jobId, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.candidates);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParseError, setResumeParseError] = useState("");
  
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

  const handleResumeFileChange = async (event) => {
    const file = event?.target?.files?.[0];
    setSelectedFileName(file ? file.name : "");
    setResumeParseError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      return;
    }

    setIsParsingResume(true);

    try {
      const parsed = await parseResumeApi(file);

      const currentName = getValues("name")?.trim();
      const currentEmail = getValues("email")?.trim();
      const currentPhone = getValues("phone")?.trim();

      if (!currentName && parsed?.name) {
        setValue("name", parsed.name, { shouldValidate: true, shouldDirty: true });
      }

      if (!currentEmail && parsed?.email) {
        setValue("email", parsed.email, { shouldValidate: true, shouldDirty: true });
      }

      if (!currentPhone && parsed?.phone) {
        setValue("phone", parsed.phone, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      setResumeParseError(
        error.response?.data?.message ||
          "Could not parse resume right now. You can still fill details manually."
      );
    } finally {
      setIsParsingResume(false);
    }
  };

  const onSubmit = async (data) => {
    const candidateData = new FormData();
    candidateData.append("jobId", jobId);
    candidateData.append("name", data.name);
    if (data.email) candidateData.append("email", data.email);
    if (data.phone) candidateData.append("phone", data.phone);
    if (data.resumeUrl) candidateData.append("resumeUrl", data.resumeUrl);
    if (data.resume?.[0]) candidateData.append("resume", data.resume[0]);

    const result = await dispatch(addCandidate(candidateData));
    
    if (addCandidate.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Add New Candidate</h2>
                <p className="text-xs md:text-sm text-gray-600">Fill in candidate details to add to pipeline</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 md:p-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="e.g., Rahul Sharma"
                    className="w-full border-2 border-gray-300 pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="e.g., rahul.sharma@example.com"
                    type="email"
                    className="w-full border-2 border-gray-300 pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    {...register("phone")}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full border-2 border-gray-300 pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">Documents</h3>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Upload Resume <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  {...register("resume", {
                    validate: {
                      fileSize: (files) => {
                        if (!files?.[0]) return true;
                        return files[0].size <= 5 * 1024 * 1024 || "File size must be 5MB or less";
                      },
                    },
                    onChange: handleResumeFileChange,
                  })}
                  className="w-full border-2 border-dashed border-gray-300 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              {selectedFileName && (
                <p className="text-xs text-green-700 mt-1.5">Selected: {selectedFileName}</p>
              )}
              {isParsingResume && (
                <p className="text-xs text-blue-700 mt-1.5">Parsing resume and auto-filling details...</p>
              )}
              {resumeParseError && (
                <p className="text-red-600 text-xs md:text-sm mt-1">{resumeParseError}</p>
              )}
              {errors.resume && (
                <p className="text-red-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.resume.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Resume URL <span className="text-gray-400 text-xs">(Optional fallback)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  {...register("resumeUrl")}
                  placeholder="e.g., https://example.com/resume.pdf"
                  className="w-full border-2 border-gray-300 pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload a file above, or provide a publicly accessible resume URL
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs md:text-sm text-blue-900 font-medium mb-1">Quick Tip</p>
                <p className="text-xs md:text-sm text-blue-800">
                  The candidate will be added to the "Applied" stage by default. You can move them to other stages later.
                </p>
                <p className="text-xs md:text-sm text-blue-800 mt-1">
                  Candidate details are auto-filled as soon as you upload a PDF resume.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 md:px-5 py-2 md:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-sm text-sm md:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Candidate...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Candidate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;