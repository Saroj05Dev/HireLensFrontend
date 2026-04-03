import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deactivateMember, selectMembers } from "./teamSlice";

const MembersList = () => {
  const dispatch = useDispatch();
  const members = useSelector(selectMembers);
  const { user } = useSelector((state) => state.auth);

  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeactivateClick = (member) => {
    setConfirmDeactivate(member);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmDeactivate) return;

    try {
      await dispatch(
        deactivateMember({
          orgId: user.organizationId,
          userId: confirmDeactivate.id, // Use 'id' instead of '_id'
        })
      ).unwrap();

      setSuccessMessage(
        `${confirmDeactivate.name} has been deactivated successfully`
      );
      setConfirmDeactivate(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrorMessage(error || "Failed to deactivate member");
      setConfirmDeactivate(null);

      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleCancelDeactivate = () => {
    setConfirmDeactivate(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Active Members
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {members.length} member{members.length !== 1 ? "s" : ""} in your
              organization
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-700 hover:text-green-900"
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
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-700 hover:text-red-900"
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
      )}

      {/* Members List */}
      <div className="divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No members yet</p>
            <p className="text-sm text-gray-400">
              Invite users to build your team
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className={`p-4 transition-colors ${
                member.isActive
                  ? "hover:bg-gray-50"
                  : "bg-gray-50 opacity-60 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      member.isActive
                        ? "bg-blue-100"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`font-semibold text-base ${
                        member.isActive
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {member.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Member Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          member.isActive
                            ? "text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {member.name}
                      </p>
                      {!member.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                      {member.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${
                        member.isActive
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {member.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {formatDate(member.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Role and Actions */}
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      member.isActive
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {member.role}
                  </span>

                  {member.isActive && (
                    <button
                      onClick={() => handleDeactivateClick(member)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            {/* Dialog Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Deactivate Member
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    This action will revoke access
                  </p>
                </div>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to deactivate{" "}
                <span className="font-semibold">{confirmDeactivate.name}</span>{" "}
                ({confirmDeactivate.email})? They will no longer be able to
                access the platform.
              </p>
            </div>

            {/* Dialog Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={handleCancelDeactivate}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
