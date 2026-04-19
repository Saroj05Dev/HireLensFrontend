import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { acceptInvite, fetchMe } from "../features/auth/authSlice";
import { validateInviteTokenApi } from "../features/team/team.api";
import AcceptInviteForm from "../features/team/AcceptInviteForm";
import { Mail, Shield, AlertCircle } from "lucide-react";

const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading, authError } = useSelector((state) => state.auth);

  const [validating, setValidating] = useState(true);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidating(true);
        setValidationError(null);
        const data = await validateInviteTokenApi(token);
        setInviteDetails(data);
      } catch (error) {
        setValidationError(
          error.response?.data?.message || "Invalid or expired invitation"
        );
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (formData) => {
    const res = await dispatch(
      acceptInvite({
        token,
        name: formData.name,
        password: formData.password,
      })
    );

    if (acceptInvite.fulfilled.match(res)) {
      // Fetch user data after successful acceptance
      const userRes = await dispatch(fetchMe());
      
      if (fetchMe.fulfilled.match(userRes)) {
        const userRole = userRes.payload.role;
        
        // Redirect based on role
        if (userRole === "INTERVIEWER") {
          navigate("/interviews");
        } else {
          navigate("/dashboard");
        }
      }
    }
  };

  // Loading state during validation
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white w-full max-w-md mx-4 p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-700 font-medium mt-6">Validating invitation...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for invalid or expired token
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Invalid Invitation
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{validationError}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Please contact your administrator for a new invitation link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    return role === "INTERVIEWER" 
      ? "bg-purple-100 text-purple-700 border-purple-200" 
      : "bg-blue-100 text-blue-700 border-blue-200";
  };

  // Main form view
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <span className="text-3xl">💼</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            You're Invited!
          </h1>
          <p className="text-blue-100 text-sm">
            Join your team on HireLens
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8">
          {/* Organization Info */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {inviteDetails?.organizationName}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getRoleBadgeColor(inviteDetails?.role)}">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold">{inviteDetails?.role}</span>
            </div>
          </div>

          {/* Email Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-medium mb-0.5">Invitation sent to</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{inviteDetails?.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <AcceptInviteForm
            onSubmit={handleSubmit}
            loading={authLoading}
            error={authError}
          />

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By accepting this invitation, you agree to join {inviteDetails?.organizationName} and gain access to their hiring platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
