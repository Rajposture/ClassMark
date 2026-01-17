import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("classmark_user"))
  );

  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
/* ✅ ADD THIS */
const [openSidebar, setOpenSidebar] = useState(false);
  /* 🔔 LOAD NOTIFICATIONS */
  const loadNotifications = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("classmark_user")
    );
    if (!currentUser) return;

    const all =
      JSON.parse(
        localStorage.getItem("classmark_notifications")
      ) || [];

    const unread = all.filter(
      (n) =>
        n.target === currentUser.role &&
        n.read === false
    );

    setNotifications(unread);
  };

  /* ✅ MARK ALL AS READ */
  const markAllAsRead = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("classmark_user")
    );
    if (!currentUser) return;

    const all =
      JSON.parse(
        localStorage.getItem("classmark_notifications")
      ) || [];

    const updated = all.map((n) =>
      n.target === currentUser.role
        ? { ...n, read: true }
        : n
    );

    localStorage.setItem(
      "classmark_notifications",
      JSON.stringify(updated)
    );

    setNotifications([]);
    window.dispatchEvent(
      new Event("notificationUpdated")
    );
  };

  /* 🔄 SYNC NOTIFICATIONS */
  useEffect(() => {
    loadNotifications();

    const handler = () => loadNotifications();

    window.addEventListener(
      "notificationUpdated",
      handler
    );
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(
        "notificationUpdated",
        handler
      );
      window.removeEventListener("storage", handler);
    };
  }, []);

  /* ❌ CLOSE DROPDOWNS ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  const logout = () => {
    localStorage.removeItem("classmark_user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav
  className="
    fixed top-0 left-0 right-0 z-50
    md:top-4 md:left-1/2 md:-translate-x-1/2
    w-full md:w-[95%] md:max-w-7xl
    rounded-none md:rounded-2xl
    bg-white/80 backdrop-blur-xl
    shadow-lg px-4 md:px-6 py-3
    flex items-center justify-between
  "
>

<div className="flex items-center gap-3">
  {/* ☰ MOBILE MENU */}
  {user && (
    <button onClick={onMenuClick} className="md:hidden text-2xl">
    ☰
  </button>
  )}

  <img
    src="/favicon.png"
    alt="ClassMark"
    className="w-10 h-10 object-contain"
  />
  <span className="text-xl font-bold text-indigo-600">
    ClassMark
  </span>
</div>


      {/* CENTER */}
      {user && (
        <div className="hidden md:flex gap-8 font-medium text-gray-700">
          <Link to={user.role === "teacher" ? "/teacher" : "/student"}>
            Dashboard
          </Link>
          <Link to="https://gpmumbai.ac.in/gpmweb/departments/computer-engineering/">
            Courses
          </Link>
          <Link to="#">Assignments</Link>
          <Link to="https://gpmumbai.ac.in/gpmweb/cdc/odd-sem-2025-26-result/">
            MIS
          </Link>
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {!user && (
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white"
          >
            Login
          </Link>
        )}

        {user && (
          <>
            {/* 🔔 NOTIFICATIONS */}
            <div
              ref={notificationRef}
              className="relative cursor-pointer"
              onClick={() => {
                setOpenNotifications(!openNotifications);
                markAllAsRead();
              }}
            >
              <span className="text-2xl">🔔</span>

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}

              {openNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl p-3 z-50">
                  <h4 className="font-semibold mb-2">
                    Notifications
                  </h4>

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
                        <p className="font-medium">
                          {n.title}
                        </p>
                        <p className="text-gray-500">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt="profile"
                onClick={() =>
                  setOpenProfile(!openProfile)
                }
                className="w-10 h-10 rounded-full border-2 border-indigo-500 cursor-pointer object-cover"
              />

              {openProfile && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl p-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user.role}
                  </p>

                  <hr className="my-3" />

                  <Link
                    to={
                      user.role === "student"
                        ? "/student/profile"
                        : "/teacher"
                    }
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full mt-2 py-2 rounded bg-red-500 text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* 🌙 MOBILE SIDEBAR */}
{openSidebar && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setOpenSidebar(false)}
    />

    {/* Sidebar */}
    <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-indigo-600">
          ClassMark
        </span>
        <button
          className="text-xl"
          onClick={() => setOpenSidebar(false)}
        >
          ✕
        </button>
      </div>

      {/* LINKS */}
      <nav className="flex flex-col gap-4 font-medium text-gray-700">
        <Link
          to={user.role === "teacher" ? "/teacher" : "/student"}
          onClick={() => setOpenSidebar(false)}
        >
          Dashboard
        </Link>

        <Link
          to="https://gpmumbai.ac.in/gpmweb/departments/computer-engineering/"
          onClick={() => setOpenSidebar(false)}
        >
          Courses
        </Link>

        <Link to="#" onClick={() => setOpenSidebar(false)}>
          Assignments
        </Link>

        <Link
          to="https://gpmumbai.ac.in/gpmweb/cdc/odd-sem-2025-26-result/"
          onClick={() => setOpenSidebar(false)}
        >
          MIS
        </Link>
      </nav>

      {/* FOOTER */}

    </aside>
  </>
)}

    </nav>
  );
  
};

export default Navbar;
