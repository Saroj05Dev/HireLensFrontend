import { useState } from "react";
import { useSelector } from "react-redux";
import { selectPendingInvites } from "./teamSlice";

const PendingInvitesList = () => {
  const pendingInvites = useSelector(selectPendingInvites);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = async (invite) => {
    const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedId(invite._id);
      
      // Clear success message after 3 seconds
      setTimeout(() => setCopiedId(null), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpirationStatus = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    
    if (expiration < now) {
      return { isExpired: true, text: "Expired", daysRemaining: 0 };
    }
    
    const daysRemaining = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
    return { 
      isExpired: false, 
      text: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`,
      daysRemaining 
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Pending Invitations
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {pendingInvites.length} pending invitation
              {pendingInvites.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="divide-y divide-gray-100">
        {pendingInvites.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm md:text-base text-gray-500 mb-1">No pending invitations</p>
            <p className="text-xs md:text-sm text-gray-400">
              Invite users to see them here
            </p>
          </div>
        ) : (
          pendingInvites.map((invite) => {
            const expirationStatus = getExpirationStatus(invite.expiresAt);
            const isCopied = copiedId === invite._id;

            return (
              <div
                key={invite._id}
                className={`p-3 md:p-4 transition-colors ${
                  expirationStatus.isExpired
                    ? "bg-gray-50 opacity-60"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 w-full sm:w-auto min-w-0">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${
                        expirationStatus.isExpired
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 md:w-6 md:h-6 ${
                          expirationStatus.isExpired
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    {/* Invite Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-xs md:text-sm font-medium truncate ${
                            expirationStatus.isExpired
                              ? "text-gray-600"
                              : "text-gray-900"
                          }`}
                        >
                          {invite.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 md:gap-3 text-xs text-gray-500">
                        <span>Created {formatDate(invite.createdAt)}</span>
                        <span className="hidden md:inline">•</span>
                        <span
                          className={
                            expirationStatus.isExpired
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {expirationStatus.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Expires on {formatDate(invite.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {/* Role and Actions */}
                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:ml-4">
                    <span
                      className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                        expirationStatus.isExpired
                          ? "bg-gray-200 text-gray-600"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {invite.role}
                    </span>

                    {expirationStatus.isExpired ? (
                      <span className="flex-1 sm:flex-none text-center px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-200">
                        Expired
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCopyLink(invite)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                          isCopied
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5 md:w-4 md:h-4"
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
                              className="w-3.5 h-3.5 md:w-4 md:h-4"
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
                            Copy Link
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PendingInvitesList;
