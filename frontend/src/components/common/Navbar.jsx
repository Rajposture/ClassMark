import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
 const [notifications, setNotifications] = useState([]);
const [openNotifications, setOpenNotifications] = useState(false);

const loadNotifications = () => {
  const user = JSON.parse(localStorage.getItem("classmark_user"));
  if (!user) return;

  const all =
    JSON.parse(localStorage.getItem("classmark_notifications")) || [];

  const filtered = all.filter(
    (n) => n.target === user.role && !n.read
  );

  setNotifications(filtered);
};


  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("classmark_user"))
  );
  const [openProfile, setOpenProfile] = useState(false);

  // 🔥 Sync user when profile updates
 useEffect(() => {
  const handler = () => {
    loadNotifications();
  };

  loadNotifications();

  window.addEventListener("notificationUpdated", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("notificationUpdated", handler);
    window.removeEventListener("storage", handler);
  };
}, []);


  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("classmark_user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl bg-white/70 backdrop-blur-xl shadow-2xl px-6 py-3 flex items-center justify-between">
      
      {/* LEFT : LOGO */}
      <div className="flex items-center gap-3">
        <img
          src="/favicon.png"
          alt="ClassMark"
          className="w-10 h-10 object-contain drop-shadow-xl"
        />
        <span className="text-xl font-bold text-indigo-600">
          ClassMark
        </span>
      </div>

      {/* CENTER : LINKS */}
      {user && (
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link to={user.role === "teacher" ? "/teacher" : "/student"}>
            Dashboard
          </Link>
          <Link to="https://gpmumbai.ac.in/gpmweb/departments/computer-engineering/">Courses</Link>
          <Link to="#">Assignments</Link>
          <Link to="https://gpmumbai.ac.in/gpmweb/cdc/odd-sem-2025-26-result/">MIS</Link>
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {!user && (
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Login
          </Link>
        )}

        {user && (
          <>
            {/* Notification */}
{/* Notification */}
<div
  className="relative cursor-pointer"
  onClick={() => {
  setOpenNotifications(!openNotifications);
  markAllAsRead();
}}
>
  {/* Bell Icon */}
  <span className="text-2xl">🔔</span>

  {/* Badge */}
  {notifications.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
      {notifications.length}
    </span>
  )}

  {/* 🔽 DROPDOWN UI (THIS IS WHERE IT GOES) */}
  {openNotifications && (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl p-3 z-50">
      <h4 className="font-semibold mb-2">Notifications</h4>

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">
          No new notifications
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="p-2 rounded-lg hover:bg-gray-100 text-sm"
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-gray-500">{n.message}</p>
          </div>
        ))
      )}
    </div>
  )}
</div>


            {/* Profile */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt="profile"
                onClick={() => setOpenProfile(!openProfile)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-indigo-500 object-cover"
              />

              {openProfile && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl bg-white shadow-2xl p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.name}`
                      }
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <Link
                    to={
                      user.role === "student"
                        ? "/student/profile"
                        : "/teacher"
                    }
                    className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
