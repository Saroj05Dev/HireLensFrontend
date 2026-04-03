import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { submitFeedback } from "./interviewSlice";

const RECOMMENDATION_OPTIONS = [
  { value: "PROCEED", label: "Proceed to next round", color: "bg-green-50 border-green-200 text-green-700", icon: "✓" },
  { value: "HOLD", label: "Maybe - needs discussion", color: "bg-yellow-50 border-yellow-200 text-yellow-700", icon: "⚠" },
  { value: "REJECT", label: "Do not proceed", color: "bg-red-50 border-red-200 text-red-700", icon: "✕" },
];

const FeedbackForm = ({ interview, onClose }) => {
  const dispatch = useDispatch();
  const { submitLoading } = useSelector((state) => state.interviews);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const watchedRecommendation = watch("recommendation");
  const watchedRating = watch("rating");
  const isSubmitting = submitLoading[interview._id];

  const onSubmit = async (data) => {
    const feedbackData = {
      rating: parseInt(data.rating),
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      recommendation: data.recommendation,
      notes: data.notes,
    };

    const result = await dispatch(submitFeedback({
      interviewId: interview._id,
      feedbackData
    }));
    
    if (submitFeedback.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submit Interview Feedback</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {interview.candidateId?.name} • {interview.jobId?.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label 
                  key={rating} 
                  className={`flex-1 cursor-pointer transition-all ${
                    watchedRating === String(rating)
                      ? 'transform scale-105'
                      : ''
                  }`}
                >
                  <input
                    {...register("rating", { required: "Please provide a rating" })}
                    type="radio"
                    value={rating}
                    className="sr-only"
                  />
                  <div className={`text-center p-3 rounded-lg border-2 transition-all ${
                    watchedRating === String(rating)
                      ? 'border-yellow-400 bg-yellow-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="text-2xl mb-1">
                      {watchedRating === String(rating) ? '★' : '☆'}
                    </div>
                    <div className={`text-xs font-medium ${
                      watchedRating === String(rating) ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      {rating}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">1 = Poor, 5 = Excellent</p>
            {errors.rating && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Strengths *
            </label>
            <textarea
              {...register("strengths", { required: "Please describe the candidate's strengths" })}
              placeholder="What did the candidate do well? (e.g., technical skills, communication, problem-solving)"
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
            {errors.strengths && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.strengths.message}
              </p>
            )}
          </div>

          {/* Weaknesses */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Areas for Improvement *
            </label>
            <textarea
              {...register("weaknesses", { required: "Please describe areas for improvement" })}
              placeholder="What could the candidate improve on? (e.g., specific skills, knowledge gaps)"
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
            {errors.weaknesses && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.weaknesses.message}
              </p>
            )}
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Recommendation *
            </label>
            <div className="space-y-2">
              {RECOMMENDATION_OPTIONS.map((option) => (
                <label 
                  key={option.value} 
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    watchedRecommendation === option.value
                      ? option.color + ' shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    {...register("recommendation", { required: "Please provide a recommendation" })}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    watchedRecommendation === option.value
                      ? 'border-current'
                      : 'border-gray-300'
                  }`}>
                    {watchedRecommendation === option.value && (
                      <div className="w-3 h-3 rounded-full bg-current"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>
                  </div>
                  <span className="text-xl">{option.icon}</span>
                </label>
              ))}
            </div>
            {errors.recommendation && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.recommendation.message}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register("notes")}
              placeholder="Any additional comments or observations..."
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;