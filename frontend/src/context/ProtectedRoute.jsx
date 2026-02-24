import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "teacher"
            ? "/teacher-dashboard"
            : "/student-dashboard"
        }
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute