import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
const navigate = useNavigate();

  // Load lectures
  useEffect(() => {
    const storedLectures = JSON.parse(localStorage.getItem("lectures"));

    if (Array.isArray(storedLectures)) {
      setLectures(storedLectures);
    } else if (storedLectures) {
      setLectures([storedLectures]);
    } else {
      setLectures([]);
    }
  }, []);

  // When a lecture is created
  const handleLectureCreated = (newLecture) => {
    const updatedLectures = [...lectures, newLecture];
    setLectures(updatedLectures);
    localStorage.setItem("lectures", JSON.stringify(updatedLectures));
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
          {/* Create Lecture */}
          <CreateLecture onCreate={handleLectureCreated} />

          {/* Lectures */}
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
                        <button
                          onClick={() => setActiveLecture(lecture)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Generate QR
                        </button>

<button
  onClick={() =>
    navigate(`/teacher/attendance/${lecture.id}`)
  }
  className="bg-gray-700 text-white px-4 py-2 rounded"
>
  View Attendance
</button>

                      </div>
                    </div>

                    {/* ✅ ATTENDANCE SECTION (CORRECT PLACE) */}
                    {selectedLecture === lecture.id && (
                      <div className="mt-4">
                        <h4 className="font-semibold">
                          Attendance List
                        </h4>

                        {(() => {
                          const attendance =
                            JSON.parse(
                              localStorage.getItem("attendance")
                            ) || {};

                          const list =
                            attendance[lecture.id] || [];

                          if (list.length === 0) {
                            return (
                              <p className="text-slate-500">
                                No attendance yet
                              </p>
                            );
                          }

                          return (
                            <ul className="mt-2 list-disc list-inside">
                              {list.map((student, index) => (
                                <li key={index}>
                                  {student.name} (
                                  {student.enrollment}) –{" "}
                                  {student.time}
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
