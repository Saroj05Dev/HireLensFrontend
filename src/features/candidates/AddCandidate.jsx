import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./candidateSlice";

const AddCandidate = ({ jobId, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.candidates);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const candidateData = {
      jobId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      resumeUrl: data.resumeUrl,
    };

    const result = await dispatch(addCandidate(candidateData));
    
    if (addCandidate.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg w-[420px] space-y-4"
      >
        <h2 className="text-lg font-semibold">Add Candidate</h2>

        <div>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Full name *"
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            placeholder="Email address *"
            type="email"
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <input
          {...register("phone")}
          placeholder="Phone number"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          {...register("resumeUrl")}
          placeholder="Resume URL"
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Candidate"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidate;