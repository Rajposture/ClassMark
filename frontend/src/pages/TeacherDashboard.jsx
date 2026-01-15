import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";

const TeacherDashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);

  // Load lectures from localStorage on mount
  useEffect(() => {
    const storedLectures =
      JSON.parse(localStorage.getItem("classmark_lectures")) || [];
    setLectures(storedLectures);
  }, []);

  // When a lecture is created
  const handleLectureCreated = (newLecture) => {
    const updatedLectures = [...lectures, newLecture];
    setLectures(updatedLectures);
    localStorage.setItem(
      "classmark_lectures",
      JSON.stringify(updatedLectures)
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-800">
          Teacher Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your lectures and attendance
        </p>

        {/* Main Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Lecture */}
          <CreateLecture onCreate={handleLectureCreated} />

          {/* Today's Lectures */}
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
                {lectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-700">
                        {lec.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {lec.date} • {lec.startTime} – {lec.endTime}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveLecture(lec)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Generate QR
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

 <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 px-6">
        <h1 className="text-3xl font-bold">
          Teacher Dashboard
        </h1>
        <p className="text-slate-500">
          Logged in successfully
        </p>
      </div>
    </div>
  
      {/* QR Modal */}
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
