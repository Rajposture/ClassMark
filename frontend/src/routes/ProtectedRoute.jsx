import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ Wait until auth check completes
  if (loading) {
    return null; // or loader component
  }

  // ❌ Not logged in → go to login and remember page
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ❌ Wrong role → redirect to correct dashboard
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;