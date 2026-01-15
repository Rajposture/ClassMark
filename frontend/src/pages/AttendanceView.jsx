import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";

const AttendanceView = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const attendance =
      JSON.parse(localStorage.getItem("attendance")) || {};

    setStudents(attendance[String(lectureId)] || []);
  }, [lectureId]);

  return (
    <>
      <Navbar />

      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/teacher")}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Attendance List
        </h2>

        {students.length === 0 ? (
          <p className="text-gray-500">
            No attendance recorded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {students.map((s, i) => (
              <li
                key={i}
                className="border rounded p-3 flex justify-between"
              >
                <span>{s.name}</span>
                <span>{s.enrollment}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AttendanceView;
