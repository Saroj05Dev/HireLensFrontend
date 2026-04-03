import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchMe, login } from "../authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading, authError } = useSelector((state) => state.auth);

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(login(data));

    if (login.fulfilled.match(res)) {
      const userRes = await dispatch(fetchMe());
      
      // Redirect based on role
      if (fetchMe.fulfilled.match(userRes)) {
        const userRole = userRes.payload.role;
        
        if (userRole === "INTERVIEWER") {
          navigate("/interviews");
        } else {
          navigate("/dashboard");
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-96 p-6 rounded-lg shadow space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">
          Sign in to your workspace
        </h1>

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
          <p className="text-sm text-red-500 text-center">
            {authError}
          </p>
        )}

        <button
          disabled={authLoading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {authLoading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don’t have a workspace?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
