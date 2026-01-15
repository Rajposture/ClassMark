import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const AttendanceForm = () => {
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const lectureId = localStorage.getItem("currentLecture");

    if (!lectureId) {
      setMessage("Invalid lecture. Please scan QR again.");
      return;
    }

    if (!name || !enrollment) {
      setMessage("Please fill all fields");
      return;
    }

    const attendance =
      JSON.parse(localStorage.getItem("attendance")) || {};

    if (!attendance[lectureId]) {
      attendance[lectureId] = [];
    }

    const alreadyMarked = attendance[lectureId].some(
      (s) => s.enrollment === enrollment
    );

    if (alreadyMarked) {
      setMessage("Attendance already submitted");
      return;
    }

    attendance[lectureId].push({
      name,
      enrollment,
      time: new Date().toLocaleTimeString(),
    });

    localStorage.setItem(
      "attendance",
      JSON.stringify(attendance)
    );

    setMessage("✅ Attendance submitted successfully");

    setTimeout(() => {
      navigate("/student");
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
            Lecture Attendance
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Please enter your details to mark attendance
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Enrollment Number
              </label>
              <input
                type="text"
                placeholder="Enter enrollment number"
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Submit Attendance
            </button>

            {message && (
              <p className="text-center text-sm mt-3 text-gray-700">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceForm;
