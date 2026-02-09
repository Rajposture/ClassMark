import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false);

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
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-indigo-600">
            ClassMark
          </h2>
        </div>
      </aside>

      <main className="pt-28 px-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
