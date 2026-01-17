import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);

  const navigate = useNavigate();

  /* ================================
     LOAD LECTURES
  ================================= */
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("classmark_lectures")) || [];
    setLectures(stored);
  }, []);

  /* ================================
     WHEN NEW LECTURE IS CREATED
  ================================= */
  const handleLectureCreated = (lecture) => {
    setLectures((prev) => [...prev, lecture]);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">
          Teacher Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your lectures and attendance
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CREATE LECTURE */}
          <CreateLecture onCreate={handleLectureCreated} />

          {/* TODAY’S LECTURES */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Today’s Lectures
            </h2>

            {lectures.length === 0 ? (
              <p className="text-slate-400 text-center py-10">
                No lectures scheduled yet
              </p>
            ) : (
              <div className="space-y-4">
                {lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-700">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {lecture.date} • {lecture.startTime} –{" "}
                          {lecture.endTime}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* GENERATE QR */}
                        <button
                          onClick={() => setActiveLecture(lecture)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Generate QR
                        </button>

                        {/* VIEW ATTENDANCE */}
                        <button
                          onClick={() =>
                            navigate(
                              `/teacher/attendance/${lecture.id}`
                            )
                          }
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                        >
                          View Attendance
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {activeLecture && (
        <GenerateQR
          lecture={activeLecture}
          onClose={() => setActiveLecture(null)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
