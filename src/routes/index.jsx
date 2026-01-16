import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Signup from "../features/auth/signup/Signup";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);

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
      {/* <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
        }
      /> */}

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
