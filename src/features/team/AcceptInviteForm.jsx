import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const AcceptInviteForm = ({ onSubmit, loading, error }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Full Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            {...register("name", { 
              required: "Name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "Name can only contain letters and spaces"
              }
            })}
            placeholder="Enter your full name"
            type="text"
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
            <span className="text-xs">⚠️</span> {errors.name.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            {...register("password", { 
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" }
            })}
            placeholder="Create a strong password"
            type={showPassword ? "text" : "password"}
            className={`w-full pl-10 pr-12 py-3 border ${
              errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {errors.password && (
          <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
            <span className="text-xs">⚠️</span> {errors.password.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Accepting...</span>
          </>
        ) : (
          <>
            <span>Accept & Join</span>
            <span className="text-lg">→</span>
          </>
        )}
      </button>
    </form>
  );
};

export default AcceptInviteForm;
