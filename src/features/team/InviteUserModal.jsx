import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  inviteUser,
  setInviteModalOpen,
  selectTeamLoading,
  selectTeamError,
  selectLastCreatedInvite,
  clearLastCreatedInvite,
} from "./teamSlice";

const InviteUserModal = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectTeamLoading);
  const error = useSelector(selectTeamError);
  const lastCreatedInvite = useSelector(selectLastCreatedInvite);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setRoleError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate role
    if (!role) {
      setRoleError("Please select a role");
      return;
    }

    // Submit invitation
    await dispatch(inviteUser({ email: email.trim(), role }));
  };

  const handleClose = () => {
    dispatch(setInviteModalOpen(false));
    dispatch(clearLastCreatedInvite());
    setEmail("");
    setRole("");
    setEmailError("");
    setRoleError("");
    setCopySuccess(false);
  };

  const handleCopyToClipboard = async () => {
    if (!lastCreatedInvite?.invite?.token) return;

    // Construct URL using current origin for local development
    const inviteUrl = `${window.location.origin}/invite/${lastCreatedInvite.invite.token}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Invite User
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Add a new member to your team
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form or Success Message */}
        <div className="flex-1 overflow-y-auto p-6">
          {lastCreatedInvite ? (
            // Success State - Show Invitation URL
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900 mb-1">
                    Invitation Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700">
                    An invitation has been created for{" "}
                    <span className="font-medium">
                      {lastCreatedInvite.invite.email}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Invitation Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/invite/${lastCreatedInvite.invite.token}`}
                    readOnly
                    className="flex-1 border-2 border-gray-300 px-4 py-2 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    {copySuccess ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                {copySuccess && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Next steps:</span> Share this
                  link with the invitee. The invitation will expire in 7 days.
                </p>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="priya.patel@company.com"
                  className={`w-full border-2 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    emailError
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Role *
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === "RECRUITER"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      value="RECRUITER"
                      checked={role === "RECRUITER"}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setRoleError("");
                      }}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                        role === "RECRUITER"
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {role === "RECRUITER" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        Recruiter
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Can manage candidates and jobs
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === "INTERVIEWER"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      value="INTERVIEWER"
                      checked={role === "INTERVIEWER"}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setRoleError("");
                      }}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                        role === "INTERVIEWER"
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {role === "INTERVIEWER" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        Interviewer
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Can conduct interviews and provide feedback
                      </p>
                    </div>
                  </label>
                </div>
                {roleError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {roleError}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {lastCreatedInvite ? (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Invitation
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
