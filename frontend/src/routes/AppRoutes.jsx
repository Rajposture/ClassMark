import { Routes, Route, Navigate } from "react-router-dom"

import Landing from "../pages/Landing"
import Login from "../pages/Login"
import Signup from "../pages/Signup"

import TeacherDashboard from "../pages/TeacherDashboard"
import StudentDashboard from "../pages/StudentDashboard"

import QRScanner from "../components/student/QRScanner"
import AttendanceForm from "../pages/AttendanceForm"

import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

const AppRoutes = () => {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />

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
        path="/attendance/:lectureId"
        element={
          <ProtectedRoute role="student" allowDirectAccess>
            <AttendanceForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
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
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
