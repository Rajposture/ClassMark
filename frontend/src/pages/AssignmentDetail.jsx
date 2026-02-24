import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../components/common/DashboardLayout";

const API = import.meta.env.VITE_API_BASE;

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!isLoaded || !isSignedIn) return;



      const res = await fetch(`${API}/api/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        const found = data.assignments.find((a) => a._id === id);
        setAssignment(found);
      }
    };

    fetchAssignment();
  }, [id, isLoaded, isSignedIn]);

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="pt-28 text-center text-gray-400 text-sm">
          Loading assignment...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 transition duration-300 shadow-sm hover:shadow-xl">

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            {assignment.title}
          </h1>

          <div className="mt-4 space-y-1">
            <p className="text-sm text-gray-500">
              {assignment.subject}
            </p>
            <p className="text-sm text-gray-400">
              Due {assignment.dueDate}
            </p>
          </div>

          {assignment.description && (
            <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
              {assignment.description}
            </p>
          )}

          {assignment.imageUrl && (
            <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
              <img
                src={assignment.imageUrl}
                alt="assignment"
                className="w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;