import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

import ProtectedRoute from "../context/ProtectedRoute"
import PublicRoute from "../context/PublicRoute"

import Landing from "../pages/Landing"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import ResetPassword from "../pages/ResetPassword"

import TeacherDashboard from "../pages/TeacherDashboard"
import StudentDashboard from "../pages/StudentDashboard"

import QRScanner from "../components/student/QRScanner"
import LectureHistory from "../components/teacher/LectureHistory"

import AttendanceForm from "../pages/AttendanceForm"
import VerifyEnrollment from "../pages/VerifyEnrollment"

import Assignments from "../pages/Assignments"
import AssignmentDetail from "../pages/AssignmentDetail"

const DashboardRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

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

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
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
        path="/verify/code/:lectureCode"
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
      <Route
  path="/attendance/code/:lectureCode"
  element={
    <ProtectedRoute role="student">
      <AttendanceForm />
    </ProtectedRoute>
  }
/>

      <Route
        path="/teacher/history"
        element={
          <ProtectedRoute role="teacher">
            <LectureHistory />
          </ProtectedRoute>
        }
      />

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

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}

export default AppRoutes