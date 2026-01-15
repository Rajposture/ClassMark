import { useState } from "react";
import { useParams } from "react-router-dom";

const AttendanceForm = () => {
  const { lectureId } = useParams(); // 🔥 ALWAYS AVAILABLE

  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = () => {
    if (!lectureId) {
      setMsg("Invalid lecture. Scan QR again.");
      return;
    }

    if (!name || !enrollment) {
      setMsg("Fill all fields");
      return;
    }

    const attendance =
      JSON.parse(localStorage.getItem("attendance")) || {};

    attendance[lectureId] = attendance[lectureId] || [];

    const alreadyMarked = attendance[lectureId].some(
      (s) => s.enrollment === enrollment
    );

    if (alreadyMarked) {
      setMsg("Attendance already submitted");
      return;
    }

    attendance[lectureId].push({
      name,
      enrollment,
      time: new Date().toLocaleTimeString(),
    });

    localStorage.setItem("attendance", JSON.stringify(attendance));

    setMsg("✅ Attendance submitted successfully");
    setName("");
    setEnrollment("");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Attendance Form</h2>

      <input
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Enrollment Number"
        value={enrollment}
        onChange={(e) => setEnrollment(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSubmit}>
        Submit Attendance
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
};

export default AttendanceForm;
