import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const protectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((s) => s.auth);

    if(loading) return <div>Loading...</div>;
    if(!isAuthenticated) return <Navigate to="/login" replace />

    return children;
}

export default protectedRoute;