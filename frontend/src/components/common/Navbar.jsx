import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [open, setOpen] = useState(false);

  // Load auth state safely
  useEffect(() => {
    const storedUser = localStorage.getItem("classmark_user");
    const storedStudent = localStorage.getItem("classmark_student");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("classmark_user");
    localStorage.removeItem("classmark_student");
    setUser(null);
    setStudent(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ClassMark
        </Link>

        {/* Right Section */}
        {!user ? (
          // 🔹 NOT LOGGED IN
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Login
          </Link>
        ) : (
          // 🔹 LOGGED IN
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              {/* Avatar */}
              <img
                src={
                  student?.avatar ||
                  "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"
                }
                alt="profile"
                className="w-9 h-9 rounded-full object-cover"
              />

              {/* Name / Role */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700">
                  {student?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user.role === "teacher" ? "Teacher" : student?.enrollment}
                </p>
              </div>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow border overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
