import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenSidebar(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () =>
      window.removeEventListener("keydown", handleEsc);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar onMenuClick={() => setOpenSidebar(true)} />

      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50
        bg-white shadow-xl transform transition-transform duration-300
        ${openSidebar ? "translate-x-0" : "-translate-x-full"}
        md:hidden`}
      >
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-indigo-600">
            ClassMark
          </h2>

          {user?.role === "teacher" && (
            <div className="flex flex-col space-y-3">
              <Link
                to="/teacher-dashboard"
                onClick={() => setOpenSidebar(false)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  isActive("/teacher-dashboard")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/teacher/history"
                onClick={() => setOpenSidebar(false)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  isActive("/teacher/history")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                History
              </Link>
            </div>
          )}
        </div>
      </aside>

      <main className="pt-28 px-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;