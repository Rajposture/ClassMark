import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  // ⏳ Wait until auth check completes
  if (loading) {
    return null;
  }

  // ❌ Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Wrong role → send to correct dashboard
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;
