import { useState } from "react";

const AttendanceForm = () => {
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = () => {
   const lectureId = String(localStorage.getItem("currentLecture"));


    if (!lectureId) {
      setMsg("Lecture not found. Scan QR again.");
      return;
    }

    if (!name || !enrollment) {
      setMsg("Fill all fields");
      return;
    }

    // get existing attendance
const attendance =
  JSON.parse(localStorage.getItem("attendance")) || {};

attendance[lectureId] = attendance[lectureId] || [];

attendance[lectureId].push({
  name,
  enrollment,
  time: new Date().toLocaleTimeString(),
});

    // save back to localStorage
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

      <button onClick={handleSubmit}>Submit Attendance</button>

      {msg && <p>{msg}</p>}
    </div>
  );
};

export default AttendanceForm;
