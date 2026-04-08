import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import ActivityPage from "../pages/ActivityPage";
import TeamPage from "../pages/TeamPage";
import AcceptInvitePage from "../pages/AcceptInvitePage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import Signup from "../features/auth/signup/Signup";
import Login from "../features/auth/login/Login";
import JobsPage from "../features/jobs/JobsPage";
import JobDetailsPage from "../features/jobs/JobDetailsPage";
import CandidateContainer from "../features/candidates/CandidateContainer";
import InterviewTasksPage from "../features/interviews/InterviewTasksPage";
import InterviewsContainer from "../features/interviews/InterviewsContainer";
import Loader from "../components/ui/Loader";

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useSelector((s) => s.auth);
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader size="lg" />
        <p className="mt-6 text-gray-700 font-semibold text-lg">
          Connecting to server...
        </p>
        <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
          Please wait. Since we're on a free hosting tier, the server might be waking up. This can take up to a minute.
        </p>
      </div>
    );
  }

  // Determine default route based on role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return "/signup";
    return user?.role === "INTERVIEWER" ? "/interviews" : "/dashboard";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/signup"
        element={
          !isAuthenticated ? <Signup /> : <Navigate to={getDefaultRoute()} />
        }
      />
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} />
        }
      />
      
      {/* Public invite acceptance route */}
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* Protected routes - Dashboard (ADMIN & RECRUITER only) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <Navigate to="/interviews" replace />
            ) : (
              <Dashboard />
            )}
          </ProtectedRoute>
        }
      />

      <Route 
        path="/jobs"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <Navigate to="/interviews" replace />
            ) : (
              <JobsPage />
            )}
          </ProtectedRoute>
        }
      />

      <Route 
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <Navigate to="/interviews" replace />
            ) : (
              <JobDetailsPage />
            )}
          </ProtectedRoute>
        }
      />

      <Route 
        path="/candidates"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <Navigate to="/interviews" replace />
            ) : (
              <CandidateContainer />
            )}
          </ProtectedRoute>
        }
      />

      {/* Interview routes - Role-based views */}
      <Route 
        path="/interviews"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <InterviewTasksPage />
            ) : (
              <InterviewsContainer />
            )}
          </ProtectedRoute>
        }
      />

      {/* Analytics route - ADMIN & RECRUITER only */}
      <Route 
        path="/analytics"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <Navigate to="/interviews" replace />
            ) : (
              <Analytics />
            )}
          </ProtectedRoute>
        }
      />

      {/* Activity route - All roles */}
      <Route 
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />

      {/* Team Management route - ADMIN only */}
      <Route 
        path="/team"
        element={
          <ProtectedRoute>
            {user?.role !== "ADMIN" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <TeamPage />
            )}
          </ProtectedRoute>
        }
      />

      {/* Profile route - All roles */}
      <Route 
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate to={getDefaultRoute()} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
