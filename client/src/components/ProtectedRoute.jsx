import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading workspace...</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
