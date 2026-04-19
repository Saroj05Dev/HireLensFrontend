import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordApi, verifyResetOTPApi, resetPasswordApi } from "../auth.api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const emailInput = e.target.email.value;
    if (!emailInput) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordApi({ email: emailInput });
      setEmail(emailInput);
      setStep(2);
      startResendTimer();
      setSuccess("Reset code sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpInput = e.target.otp.value;
    if (!otpInput || otpInput.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyResetOTPApi({ email, otp: otpInput });
      setStep(3);
      setSuccess("Code verified! Set your new password");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPasswordApi({ email, newPassword });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordApi({ email });
      startResendTimer();
      setSuccess("New code sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/images/hirelens-logo.png" alt="HireLens Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 && "Reset your password"}
            {step === 2 && "Verify your email"}
            {step === 3 && "Create new password"}
          </h1>
          <p className="text-gray-600">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the code sent to your email"}
            {step === 3 && "Choose a strong password"}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? "bg-red-600" : "bg-gray-200"}`}></div>
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`}></div>
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 3 ? "bg-red-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex items-center justify-center gap-8 mt-2">
            <span className={`text-xs font-medium ${step >= 1 ? "text-red-600" : "text-gray-400"}`}>Email</span>
            <span className={`text-xs font-medium ${step >= 2 ? "text-red-600" : "text-gray-400"}`}>Verify</span>
            <span className={`text-xs font-medium ${step >= 3 ? "text-red-600" : "text-gray-400"}`}>Reset</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {success && (
            <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input id="email" name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50 shadow-lg">
                {loading ? "Sending..." : "Send reset code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">Code sent to <span className="font-semibold">{email}</span></p>
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Reset code</label>
                <input id="otp" name="otp" type="text" maxLength="6" required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="000000" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 shadow-lg">
                {loading ? "Verifying..." : "Verify code"}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">Resend in {resendTimer}s</p>
                ) : (
                  <button type="button" onClick={handleResendOTP} className="text-sm text-red-600 font-medium">Resend code</button>
                )}
              </div>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-600">← Change email</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="newPassword" required minLength="6" className="w-full px-4 py-3 border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Enter new password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                <input type={showPassword ? "text" : "password"} name="confirmPassword" required minLength="6" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Confirm new password" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 shadow-lg">
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Remember your password? <Link to="/login" className="font-medium text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
