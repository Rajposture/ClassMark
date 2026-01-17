import { useState } from "react";

const CreateLecture = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCreateLecture = (e) => {
    e.preventDefault();

    if (!title || !date || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }

    const newLecture = {
      id: Date.now(),
      title,
      date,
      startTime,
      endTime,
      createdAt: Date.now(),
    };

    /* ================================
       1️⃣ SAVE LECTURE
    ================================= */
    const lectures =
      JSON.parse(localStorage.getItem("classmark_lectures")) || [];

    lectures.push(newLecture);
    localStorage.setItem(
      "classmark_lectures",
      JSON.stringify(lectures)
    );

    /* ================================
       2️⃣ CREATE STUDENT NOTIFICATION
    ================================= */
// 🔔 CREATE STUDENT NOTIFICATION
const notifications =
  JSON.parse(localStorage.getItem("classmark_notifications")) || [];

notifications.push({
  id: newLecture.id,
  title: newLecture.title,
  message: `New lecture scheduled on ${date} (${startTime} - ${endTime})`,
  target: "student",   // ✅ IMPORTANT
  read: false,
  createdAt: Date.now(),
});

localStorage.setItem(
  "classmark_notifications",
  JSON.stringify(notifications)
);

// 🔥 Notify all listeners
window.dispatchEvent(new Event("notificationUpdated"));


    // 🔔 Notify Navbar instantly
    window.dispatchEvent(new Event("notificationUpdated"));

    /* ================================
       3️⃣ INFORM PARENT DASHBOARD
    ================================= */
    if (onCreate) {
      onCreate(newLecture);
    }

    /* ================================
       4️⃣ RESET FORM
    ================================= */
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");

    alert("Lecture created successfully");
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        Schedule Lecture
      </h2>

      <form onSubmit={handleCreateLecture} className="space-y-4">
        {/* Lecture Title */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Lecture Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Operating Systems"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600
            text-white font-medium hover:bg-indigo-700 transition"
        >
          Create Lecture
        </button>
      </form>
    </div>
  );
};

export default CreateLecture;
