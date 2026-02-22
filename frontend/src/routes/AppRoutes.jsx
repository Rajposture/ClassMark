import { Routes, Route, Navigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import QRScanner from "../components/student/QRScanner";
import AttendanceForm from "../pages/AttendanceForm";
import Assignments from "../pages/Assignments";
import AssignmentDetail from "../pages/AssignmentDetail";
import CompleteProfile from "../pages/CompleteProfile";

const API = import.meta.env.VITE_API_BASE;

/* ================= REQUIRE AUTH ================= */

const RequireAuth = ({ children, role }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [dbUser, setDbUser] = useState(undefined);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await getToken();

        const res = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDbUser(res.data.user);
      } catch {
        setDbUser(null);
      } finally {
        setChecking(false);
      }
    };

    if (isLoaded && isSignedIn) {
      checkUser();
    } else if (isLoaded) {
      setChecking(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  if (dbUser === null)
    return <Navigate to="/complete-profile" replace />;

  if (role && dbUser?.role !== role)
    return <Navigate to="/dashboard" replace />;

  return children;
};

/* ================= DASHBOARD REDIRECT ================= */

const DashboardRedirect = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!isSignedIn) return;

      const token = await getToken();

      const res = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRole(res.data.user.role);
    };

    if (isLoaded && isSignedIn) {
      fetchRole();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!role) return null;

  return (
    <Navigate
      to={role === "teacher" ? "/teacher" : "/student"}
      replace
    />
  );
};

/* ================= ROUTES ================= */

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔥 DO NOT WRAP THIS */}
      <Route
        path="/complete-profile"
        element={<CompleteProfile />}
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardRedirect />
          </RequireAuth>
        }
      />

      <Route
        path="/attendance/:lectureId"
        element={
          <RequireAuth role="student">
            <AttendanceForm />
          </RequireAuth>
        }
      />

      <Route
        path="/student"
        element={
          <RequireAuth role="student">
            <StudentDashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/scan"
        element={
          <RequireAuth role="student">
            <QRScanner />
          </RequireAuth>
        }
      />

      <Route
        path="/assignments"
        element={
          <RequireAuth>
            <Assignments />
          </RequireAuth>
        }
      />

      <Route
        path="/assignments/:id"
        element={
          <RequireAuth>
            <AssignmentDetail />
          </RequireAuth>
        }
      />

      <Route
        path="/teacher"
        element={
          <RequireAuth role="teacher">
            <TeacherDashboard />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
};

export default AppRoutes;