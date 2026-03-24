import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../components/layouts/Layout";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;