import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Landing from "../pages/Landing";
import Login from "../pages/Login";

import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";

import QRScanner from "../components/student/QRScanner";
import AttendanceForm from "../pages/AttendanceForm";
import AttendanceView from "../pages/AttendanceView";
import StudentProfile from "../components/student/StudentProfile";

const AppRoutes = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("classmark_user"))
  );

  // 🔥 LISTEN FOR LOGIN / LOGOUT / PROFILE UPDATE
  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("classmark_user")));
    };

    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          user?.role === "student" ? (
            <StudentDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/scan"
        element={
          user?.role === "student" ? (
            <QRScanner />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/attendance/:lectureId"
        element={
          user?.role === "student" ? (
            <AttendanceForm />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/student/profile"
        element={
          user?.role === "student" ? (
            <StudentProfile />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* TEACHER */}
      <Route
        path="/teacher"
        element={
          user?.role === "teacher" ? (
            <TeacherDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/teacher/attendance/:lectureId"
        element={
          user?.role === "teacher" ? (
            <AttendanceView />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
