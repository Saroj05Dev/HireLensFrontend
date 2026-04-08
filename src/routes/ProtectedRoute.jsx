import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../components/layouts/Layout";
import Loader from "../components/ui/Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Loading..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;