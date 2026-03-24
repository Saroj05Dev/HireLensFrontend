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

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/signup"
        element={
          !isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />
        }
      />
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path="jobs"
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        }
      />

      <Route 
        path="jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route 
        path="candidates"
        element={
          <ProtectedRoute>
            <CandidateContainer />
          </ProtectedRoute>
        }
      />

      {/* Interview routes - role-based */}
      <Route 
        path="interviews"
        element={
          <ProtectedRoute>
            {user?.role === "INTERVIEWER" ? <InterviewTasksPage /> : <InterviewsContainer />}
          </ProtectedRoute>
        }
      />

      {/* Analytics route */}
      <Route 
        path="analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/signup"}
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
