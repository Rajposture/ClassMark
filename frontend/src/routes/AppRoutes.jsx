import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import ProtectedRoute from "../context/ProtectedRoute"

import Landing from "../pages/Landing"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import TeacherDashboard from "../pages/TeacherDashboard"
import StudentDashboard from "../pages/StudentDashboard"
import QRScanner from "../components/student/QRScanner"
import AttendanceForm from "../pages/AttendanceForm"
import Assignments from "../pages/Assignments"
import AssignmentDetail from "../pages/AssignmentDetail"
import VerifyEnrollment from "../pages/VerifyEnrollment"

/* ================= DASHBOARD REDIRECT ================= */

const DashboardRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

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

/* ================= ROUTES ================= */

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboard Auto Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute role="student">
            <QRScanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/verify/:lectureId"
        element={
          <ProtectedRoute role="student">
            <VerifyEnrollment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/:lectureId"
        element={
          <ProtectedRoute role="student">
            <AttendanceForm />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <Assignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:id"
        element={
          <ProtectedRoute>
            <AssignmentDetail />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  )
}

export default AppRoutes