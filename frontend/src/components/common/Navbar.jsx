import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  // 🔥 Load user + listen for login/logout
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    loadUser();
    window.addEventListener("user-login", loadUser);
    window.addEventListener("user-logout", loadUser);

    return () => {
      window.removeEventListener("user-login", loadUser);
      window.removeEventListener("user-logout", loadUser);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔥 PROFILE PIC CHANGE HANDLER (FIX)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = {
        ...user,
        profilePic: reader.result,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser); // instant UI update
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-logout"));
    setOpen(false);
    navigate("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow z-50 flex items-center justify-between px-6">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-indigo-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        ClassMark
      </h1>

      {/* Right side */}
      {!user ? (
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Login
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar */}
          <div
            onClick={() => setOpen(!open)}
            className="cursor-pointer"
          >
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                {initials}
              </div>
            )}
          </div>

          {/* Profile Card */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-4"
              onClick={(e) => e.stopPropagation()} // 🔥 VERY IMPORTANT
            >
              <div className="text-center">
                {/* 🔥 CLICKABLE AVATAR */}
                <label className="cursor-pointer inline-block">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto text-xl">
                      {initials}
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* User Info */}
                <h3 className="mt-2 font-semibold text-gray-800">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Enrollment: {user.enrollment}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
