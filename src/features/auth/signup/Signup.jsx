import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMe, signup } from "../authSlice";


const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authLoading, authError } = useSelector((state) => state.auth);

    const { register, handleSubmit } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await dispatch(signup(data));

            if(signup.fulfilled.match(res)) {
                await dispatch(fetchMe());
                navigate("/dashboard");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-96 p-6 rounded-lg shadow space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">
          Create your workspace
        </h1>

        <input
          {...register("organizationName", { required: true })}
          placeholder="Organization name"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          {...register("name", { required: true })}
          placeholder="Admin name"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          {...register("email", { required: true })}
          placeholder="Email"
          type="email"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          {...register("password", { required: true })}
          placeholder="Password"
          type="password"
          className="w-full border px-3 py-2 rounded"
        />

        {authError && (
          <p className="text-sm text-red-500">{authError}</p>
        )}

        <button
          disabled={authLoading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {authLoading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}

export default Signup;