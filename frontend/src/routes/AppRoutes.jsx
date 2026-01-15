import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import TeacherDashboard from "../pages/TeacherDashboard";




const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/teacher" element={<TeacherDashboard />} />


    </Routes>
  );
};

export default AppRoutes;
