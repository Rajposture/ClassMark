import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";

import QRScanner from "../components/student/QRScanner";
import AttendanceForm from "../pages/AttendanceForm";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { AuthContext } from "../context/AuthContext";

const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={user.role === "teacher" ? "/teacher" : "/student"}
      replace
    />
  );
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
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
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/:lectureId"
        element={<AttendanceForm />}
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

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;
