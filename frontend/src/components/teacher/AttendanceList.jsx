const AttendanceList = ({ lecture, onClose }) => {
  // Get all attendance records
  const attendance =
    JSON.parse(localStorage.getItem("classmark_attendance")) || [];

  // Filter by lecture
  const lectureAttendance = attendance.filter(
    (a) => a.lectureId === lecture.id
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-slate-800">
          Attendance List
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          {lecture.title}
        </p>

        {lectureAttendance.length === 0 ? (
          <p className="text-center text-slate-400 py-10">
            No students have marked attendance yet
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Enrollment</th>
                  <th className="px-4 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {lectureAttendance.map((student, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      {student.name}
                    </td>
                    <td className="px-4 py-2">
                      {student.enrollment}
                    </td>
                    <td className="px-4 py-2">
                      {student.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
