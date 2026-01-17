import { useState, useEffect } from "react";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false);

  // Close sidebar on ESC
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpenSidebar(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar controls sidebar */}
      <Navbar onMenuClick={() => setOpenSidebar(true)} />

      {/* 🔥 DARK OVERLAY (click anywhere to close) */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* 🧊 GLASS SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-white/80 backdrop-blur-2xl
          shadow-2xl border-r border-white/30
          transform transition-transform duration-300
          ${openSidebar ? "translate-x-0" : "-translate-x-full"}
          md:hidden
        `}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-indigo-600">ClassMark</h2>

          <nav className="space-y-3 font-medium text-gray-700">
            <a href="#" className="block">Dashboard</a>
            <a href="#" className="block">Courses</a>
            <a href="#" className="block">Assignments</a>
            <a href="#" className="block">MIS</a>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pt-20 md:pt-28 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
