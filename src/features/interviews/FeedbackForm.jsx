import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { submitFeedback } from "./interviewSlice";

const RECOMMENDATION_OPTIONS = [
  { value: "PROCEED", label: "Proceed to next round", color: "text-green-600" },
  { value: "HOLD", label: "Maybe - needs discussion", color: "text-yellow-600" },
  { value: "REJECT", label: "Do not proceed", color: "text-red-600" },
];

const FeedbackForm = ({ interview, onClose }) => {
  const dispatch = useDispatch();
  const { submitLoading } = useSelector((state) => state.interviews);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const watchedRecommendation = watch("recommendation");
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Interview Feedback</h2>
              <p className="text-gray-600 mt-1">
                {interview.candidateId?.name} - {interview.jobId?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto max-h-96">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    {...register("rating", { required: "Please provide a rating" })}
                    type="radio"
                    value={rating}
                    className="mr-1"
                  />
                  <span className="text-sm">{rating}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">1 = Poor, 5 = Excellent</p>
            {errors.rating && (
              <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Strengths *
            </label>
            <textarea
              {...register("strengths", { required: "Please describe the candidate's strengths" })}
              placeholder="What did the candidate do well?"
              className="w-full border px-3 py-2 rounded text-sm"
              rows={3}
            />
            {errors.strengths && (
              <p className="text-red-500 text-xs mt-1">{errors.strengths.message}</p>
            )}
          </div>

          {/* Weaknesses */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Areas for Improvement *
            </label>
            <textarea
              {...register("weaknesses", { required: "Please describe areas for improvement" })}
              placeholder="What could the candidate improve on?"
              className="w-full border px-3 py-2 rounded text-sm"
              rows={3}
            />
            {errors.weaknesses && (
              <p className="text-red-500 text-xs mt-1">{errors.weaknesses.message}</p>
            )}
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recommendation *
            </label>
            <div className="space-y-2">
              {RECOMMENDATION_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    {...register("recommendation", { required: "Please provide a recommendation" })}
                    type="radio"
                    value={option.value}
                    className="mr-2"
                  />
                  <span className={`text-sm ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.recommendation && (
              <p className="text-red-500 text-xs mt-1">{errors.recommendation.message}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Notes
            </label>
            <textarea
              {...register("notes")}
              placeholder="Any additional comments or observations"
              className="w-full border px-3 py-2 rounded text-sm"
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;