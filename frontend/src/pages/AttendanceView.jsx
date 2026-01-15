import { useParams, useNavigate } from "react-router-dom";

const AttendanceView = () => {
const { lectureId } = useParams();

const attendance =
  JSON.parse(localStorage.getItem("attendance")) || {};

const list = attendance[String(lectureId)] || [];

const handleBack = () => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate("/teacher");
  }
};
  return (
    <div className="min-h-screen bg-slate-100 p-8">
<button
  onClick={() => {
    window.location.href = "/teacher";
  }}
  className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
>
  ← Back to Dashboard
</button>



      <h1 className="text-2xl font-bold mb-4">
        Attendance List
      </h1>

      {list.length === 0 ? (
        <p className="text-gray-500">
          No attendance recorded yet.
        </p>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Enrollment</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {list.map((student, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.enrollment}</td>
                <td className="p-3">{student.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceView;
