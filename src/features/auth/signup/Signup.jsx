import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchMe, signup } from "../authSlice";
import { sendOTPApi, verifyOTPApi } from "../auth.api";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading, authError } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const password = watch("password");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const emailInput = e.target.email.value;
    if (!emailInput) {
      setOtpError("Email is required");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await sendOTPApi({ email: emailInput });
      setEmail(emailInput);
      setValue("email", emailInput);
      setStep(2);
      startResendTimer();
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpInput = e.target.otp.value;
    if (!otpInput || otpInput.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await verifyOTPApi({ email, otp: otpInput });
      setStep(3);
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      await sendOTPApi({ email });
      startResendTimer();
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

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

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(signup(data));
      if (signup.fulfilled.match(res)) {
        await dispatch(fetchMe());
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
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
            {step === 1 && "Create your workspace"}
            {step === 2 && "Verify your email"}
            {step === 3 && "Complete your profile"}
          </h1>
          <p className="text-gray-600">
            {step === 1 && "Get started in minutes"}
            {step === 2 && "Enter the code sent to your email"}
            {step === 3 && "Just a few more details"}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex items-center justify-center gap-8 mt-2">
            <span className={`text-xs font-medium ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>Email</span>
            <span className={`text-xs font-medium ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>Verify</span>
            <span className={`text-xs font-medium ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>Details</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input id="email" name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="priya@company.com" />
              </div>
              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{otpError}</p>
                </div>
              )}
              <button type="submit" disabled={otpLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg">
                {otpLoading ? "Sending OTP..." : "Send verification code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">Code sent to <span className="font-semibold">{email}</span></p>
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                <input id="otp" name="otp" type="text" maxLength="6" required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest" placeholder="000000" />
              </div>
              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{otpError}</p>
                </div>
              )}
              <button type="submit" disabled={otpLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 shadow-lg">
                {otpLoading ? "Verifying..." : "Verify code"}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">Resend in {resendTimer}s</p>
                ) : (
                  <button type="button" onClick={handleResendOTP} className="text-sm text-blue-600 font-medium">Resend code</button>
                )}
              </div>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-600">← Change email</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization name</label>
                <input type="text" {...register("organizationName", { required: true, minLength: 2 })} className="w-full px-4 py-3 border rounded-lg" placeholder="Acme Inc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                <input type="text" {...register("name", { required: true, minLength: 2 })} className="w-full px-4 py-3 border rounded-lg" placeholder="Priya Patel" />
              </div>
              <input type="hidden" {...register("email")} value={email} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} {...register("password", { required: true, minLength: 6 })} className="w-full px-4 py-3 border rounded-lg pr-12" placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}
              <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 shadow-lg">
                {authLoading ? "Creating workspace..." : "Create workspace"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have a workspace? <Link to="/login" className="font-medium text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
