import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (user?.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  if (user?.role === "student") {
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default PublicRoute;
