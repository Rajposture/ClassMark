import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import QRScanner from "../components/student/QRScanner";
import AttendanceForm from "../pages/AttendanceForm";
import AttendanceView from "../pages/AttendanceView";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
<Route path="/student" element={<StudentDashboard />} />
<Route path="/scan" element={<QRScanner />} />
 <Route path="/attendance" element={<AttendanceForm />} />
      <Route
        path="/teacher/attendance/:lectureId"
        element={<AttendanceView />}
      />
    </Routes>
  );
};

export default AppRoutes;
