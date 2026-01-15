const RoleSelector = ({ role, setRole }) => {
  return (
    <div className="flex gap-4 mt-4">
      <button
        type="button"
        onClick={() => setRole("student")}
        className={`flex-1 py-2 rounded-lg border transition ${
          role === "student"
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-700 border-slate-300"
        }`}
      >
        Student
      </button>

      <button
        type="button"
        onClick={() => setRole("teacher")}
        className={`flex-1 py-2 rounded-lg border transition ${
          role === "teacher"
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-700 border-slate-300"
        }`}
      >
        Teacher
      </button>
    </div>
  );
};

export default RoleSelector;
