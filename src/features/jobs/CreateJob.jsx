import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createJob } from "./jobsSlice";

const CreateJob = ({ onClose }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
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

    await dispatch(createJob(payload));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded w-[420px] space-y-4"
      >
        <h2 className="text-lg font-semibold">Create Job</h2>

        <input
          {...register("title", { required: true })}
          placeholder="Job title"
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          {...register("description")}
          placeholder="Job description"
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />

        <input
          {...register("skills")}
          placeholder="Skills (comma separated)"
          className="w-full border px-3 py-2 rounded"
        />

        <select
          {...register("experience")}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select experience</option>
          <option value="0-1 years">0–1 years</option>
          <option value="1-3 years">1–3 years</option>
          <option value="3-5 years">3–5 years</option>
          <option value="5+ years">5+ years</option>
        </select>

        <input
          {...register("location")}
          placeholder="Location (e.g. Remote, Bangalore)"
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
