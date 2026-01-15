import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("classmark_user"));
    const profile = JSON.parse(localStorage.getItem("classmark_student"));

    if (user && user.role === "student") {
      setStudent(profile);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">
          Student Dashboard
        </h1>
        <p className="text-slate-500">
          View your profile and attendance
        </p>

        {/* Profile Card */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Profile
          </h2>

          {student ? (
            <div className="space-y-2 text-slate-700">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {student.name}
              </p>
              <p>
                <span className="font-medium">Enrollment:</span>{" "}
                {student.enrollment}
              </p>
            </div>
          ) : (
            <p className="text-slate-400">
              Profile not set yet
            </p>
          )}
        </div>

        {/* Attendance Section */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Attendance
          </h2>

          <p className="text-slate-400">
            Attendance graph will appear here
          </p>

          <button
  onClick={() => navigate("/scan")}
  className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg"
>
  Scan QR for Attendance
</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
