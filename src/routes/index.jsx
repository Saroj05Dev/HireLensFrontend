import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import ProtectedRoute from "./ProtectedRoute";
import Signup from "../features/auth/signup/Signup";
import Login from "../features/auth/login/Login";
import JobsPage from "../features/jobs/jobsPage";
import JobDetailsPage from "../features/jobs/JobDetailsPage";
import CandidateContainer from "../features/candidates/CandidateContainer";
import InterviewTasksPage from "../features/interviews/InterviewTasksPage";
import InterviewsContainer from "../features/interviews/InterviewsContainer";

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useSelector((s) => s.auth);

  if (loading) return null;

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

      {/* Interview routes - INTERVIEWER only */}
      <Route 
        path="/interviews"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? (
              <InterviewTasksPage />
            ) : (
              <Navigate to="/dashboard" replace />
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
