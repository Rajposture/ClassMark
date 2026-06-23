import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiMenu, FiX, FiLogOut } from "react-icons/fi"
import { IoNotificationsOutline } from "react-icons/io5"
import { io } from "socket.io-client"
import { useAuth } from "../../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const isSignedIn = !!user
  const navigate = useNavigate()

  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const socketRef = useRef(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [openSidebar, setOpenSidebar] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [bellGlow, setBellGlow] = useState(false)
  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    if (data.success) {
      setNotifications(data.notifications || [])
    }
  } catch (error) {
    console.error("Notification fetch error:", error)
  }
}

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setOpenNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
  if (isSignedIn) {
    fetchNotifications()
  }
}, [isSignedIn])

useEffect(() => {
  if (!isSignedIn) return

  socketRef.current = io(
    import.meta.env.VITE_API_BASE.replace("/api", ""),
    {
      transports: ["websocket"]
    }
  )

  const triggerGlow = () => {
    setBellGlow(true)
    setTimeout(() => setBellGlow(false), 1500)
  }

  const handleNewLecture = (notification) => {
    setNotifications((prev) => [
      notification,
      ...prev
    ])
    triggerGlow()
  }

  const handleNewAssignment = (notification) => {
    setNotifications((prev) => [
      notification,
      ...prev
    ])
    triggerGlow()
  }

  socketRef.current.on("newLecture", handleNewLecture)
  socketRef.current.on("newAssignment", handleNewAssignment)

  return () => {
    socketRef.current.off("newLecture", handleNewLecture)
    socketRef.current.off("newAssignment", handleNewAssignment)
    socketRef.current.disconnect()
  }
}, [isSignedIn])

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-7xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-xl rounded-2xl px-6 py-3 flex justify-between items-center text-slate-900">

          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-2xl text-slate-900"
              onClick={() => setOpenSidebar(true)}
            >
              <FiMenu />
            </button>

            <span className="text-xl font-semibold tracking-tight text-slate-900">
              ClassMark
            </span>
          </div>

          {isSignedIn && (
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-800">
              <Link to="/dashboard" className="hover:text-indigo-600 transition">
                Dashboard
              </Link>

              {user?.role === "teacher" && (
                <Link to="/teacher/history" className="hover:text-indigo-600 transition">
                  History
                </Link>
              )}

              <Link to="/assignments" className="hover:text-indigo-600 transition">
                Assignments
              </Link>

              <a
                href="https://lssimss.com/GPMMIS/jsp/userlogin.action"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition"
              >
                MIS
              </a>
            </div>
          )}

          <div className="flex items-center gap-6">
            {!isSignedIn && (
              <Link
                to="/login"
                className="px-5 py-2 bg-white text-black rounded-full text-sm hover:opacity-90 transition"
              >
                Login
              </Link>
            )}

            {isSignedIn && (
              <>
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setOpenNotifications(!openNotifications)}
                    className={`relative text-xl text-slate-900 transition ${
                      bellGlow
                        ? "animate-pulse scale-110 text-indigo-600"
                        : "hover:text-indigo-600"
                    }`}
                  >
                    <IoNotificationsOutline />
                    {notifications.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {openNotifications && (
                    <div className="absolute right-0 mt-4 w-80 max-w-[90vw] max-h-96 overflow-y-auto backdrop-blur-xl bg-black/90 border border-white/20 shadow-2xl rounded-2xl p-4 text-white">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={async () => {
  try {
    const token = localStorage.getItem("token")

    await fetch(
      `${import.meta.env.VITE_API_BASE}/notifications/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    setNotifications([])
  } catch (err) {
    console.error(err)
  }
}}
                            className="text-xs underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <p className="text-sm text-white/60">
                          No new notifications
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((n, index) => (
                            <div
                              key={n._id || index}
                              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                            >
                              <p className="text-sm font-medium">
  {n.title}
</p>

<p className="text-xs text-white/70 mt-1">
  {n.message}
</p>

<p className="text-xs text-white/60">
  {n.createdAt
    ? new Date(n.createdAt).toLocaleString()
    : ""}
</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div ref={dropdownRef} className="relative">
                  <div
                    onClick={() => setOpenProfile(!openProfile)}
                    className="w-10 h-10 rounded-full overflow-hidden border border-white/30 cursor-pointer"
                  >
                    <img
                      src={
                        user?.image ||
                        "https://ui-avatars.com/api/?name=" + user?.name
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {openProfile && (
                    <div className="absolute right-0 mt-4 w-72 backdrop-blur-xl bg-black/90 border border-white/20 shadow-2xl rounded-2xl p-6 text-white">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            user?.image ||
                            "https://ui-avatars.com/api/?name=" + user?.name
                          }
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{user?.name}</p>
                          <p className="text-sm text-white/60">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="mt-6 w-full py-2 rounded-xl bg-white text-black flex items-center justify-center gap-2 hover:opacity-90 transition"
                      >
                        <FiLogOut />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          openSidebar ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-md"
          onClick={() => setOpenSidebar(false)}
        />

        <div
          className={`absolute top-0 left-0 h-full w-72 backdrop-blur-2xl bg-white/30 border-r border-white/20 shadow-2xl p-6 transform transition-transform duration-300 ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-10 text-slate-900">
            <span className="text-lg font-semibold">Menu</span>
            <button onClick={() => setOpenSidebar(false)}>
              <FiX />
            </button>
          </div>

          <div className="space-y-6 text-slate-900 font-medium text-sm">
            <Link
              to="/dashboard"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-indigo-600 transition"
            >
              Dashboard
            </Link>

            {user?.role === "teacher" && (
              <Link
                to="/teacher/history"
                onClick={() => setOpenSidebar(false)}
                className="block hover:text-indigo-600 transition"
              >
                History
              </Link>
            )}

            <Link
              to="/assignments"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-indigo-600 transition"
            >
              Assignments
            </Link>

            <a
              href="https://lssimss.com/GPMMIS/jsp/userlogin.action"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-indigo-600 transition"
            >
              MIS
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar