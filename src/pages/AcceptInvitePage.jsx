import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { acceptInvite, fetchMe } from "../features/auth/authSlice";
import { validateInviteTokenApi } from "../features/team/team.api";
import AcceptInviteForm from "../features/team/AcceptInviteForm";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white w-96 p-6 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Error state for invalid or expired token
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white w-96 p-6 rounded-lg shadow text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-4">{validationError}</p>
          <p className="text-sm text-gray-500">
            Please contact your administrator for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold text-center mb-2">
          Join {inviteDetails?.organizationName}
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          You've been invited as a <span className="font-medium">{inviteDetails?.role}</span>
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Email:</span> {inviteDetails?.email}
          </p>
        </div>

        <AcceptInviteForm
          onSubmit={handleSubmit}
          loading={authLoading}
          error={authError}
        />
      </div>
    </div>
  );
};

export default AcceptInvitePage;
