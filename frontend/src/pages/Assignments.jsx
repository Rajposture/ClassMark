import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiTrash2, FiArrowRight } from "react-icons/fi";
import DashboardLayout from "../components/common/DashboardLayout";
import CreateAssignment from "../components/teacher/CreateAssignment";

const API = import.meta.env.VITE_API_BASE;

const Assignments = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !isSignedIn) return;



      const meRes = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const meData = await meRes.json();
      if (meRes.ok) {
        setDbUser(meData.user);
      }

      const res = await fetch(`${API}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) setAssignments(data.assignments || []);
    };

    init();
  }, [isLoaded, isSignedIn]);

  const handleDelete = async (id) => {
    const token = await clerkUser.getToken();

    const res = await fetch(`${API}/api/assignments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    }
  };

  const isTeacher =
    dbUser?.role?.toLowerCase() === "teacher";

  const filteredAssignments = isTeacher
    ? assignments.filter((a) => a.teacherId?._id === dbUser?._id)
    : assignments;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-12">
          Assignments
        </h1>

        {isTeacher && (
          <div className="mb-14">
            <CreateAssignment onCreated={() => window.location.reload()} />
          </div>
        )}

        <div className="space-y-6">
          {filteredAssignments.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No assignments available
            </p>
          ) : (
            filteredAssignments.map((a) => (
              <div
                key={a._id}
                className="group bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 transition duration-300 hover:shadow-xl hover:-translate-y-[2px]"
              >
                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {a.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {a.subject}
                    </p>

                    <p className="text-sm text-gray-400">
                      Due {a.dueDate}
                    </p>
                  </div>

                  {isTeacher && (
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="p-2 rounded-lg transition hover:bg-red-50"
                    >
                      <FiTrash2 className="text-red-500 text-lg transition group-hover:text-red-600" />
                    </button>
                  )}
                </div>

                {(a.imageUrl || a.secure_url) && (
                  <div className="mt-5 overflow-hidden rounded-xl border">
                    <img
                      src={a.imageUrl || a.secure_url}
                      alt="assignment"
                      className="w-full object-cover max-h-64 transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => navigate(`/assignments/${a._id}`)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition"
                  >
                    View Details
                    <FiArrowRight className="text-base transition group-hover:translate-x-1" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;