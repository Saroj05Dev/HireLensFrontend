import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMembers,
  fetchPendingInvites,
  selectMembers,
  selectPendingInvites,
  selectTeamLoading,
  selectTeamError,
  setInviteModalOpen,
  selectInviteModalOpen,
  clearError,
} from "../features/team/teamSlice";
import InviteUserModal from "../features/team/InviteUserModal";
import Loader from "../components/ui/Loader";
import MembersList from "../features/team/MembersList";
import PendingInvitesList from "../features/team/PendingInvitesList";

const TeamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const members = useSelector(selectMembers);
  const pendingInvites = useSelector(selectPendingInvites);
  const loading = useSelector(selectTeamLoading);
  const error = useSelector(selectTeamError);
  const inviteModalOpen = useSelector(selectInviteModalOpen);

  // Admin-only access check
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Fetch data on mount
  useEffect(() => {
    if (user?.role === "ADMIN") {
      dispatch(fetchMembers());
      dispatch(fetchPendingInvites());
    }
  }, [dispatch, user]);

  const handleOpenInviteModal = () => {
    dispatch(setInviteModalOpen(true));
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  // Loading state
  if (loading && members.length === 0 && pendingInvites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader text="Loading team data..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage your organization members and invitations
            </p>
          </div>
          <button
            onClick={handleOpenInviteModal}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Invite User
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg mb-4 md:mb-6 flex items-center justify-between text-sm md:text-base">
          <span>{error}</span>
          <button
            onClick={handleCloseError}
            className="text-red-700 hover:text-red-900 shrink-0 ml-2"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
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

      {/* Active Members Section */}
      <div className="mb-4 md:mb-6">
        <MembersList />
      </div>

      {/* Pending Invitations Section */}
      <div className="mb-4 md:mb-6">
        <PendingInvitesList />
      </div>

      {/* Invite User Modal */}
      {inviteModalOpen && <InviteUserModal />}
    </div>
  );
};

export default TeamPage;
