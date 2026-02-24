import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiMenu, FiX, FiLogOut } from "react-icons/fi"
import { IoNotificationsOutline } from "react-icons/io5"
import { io } from "socket.io-client"
import { useAuth } from "../../context/AuthContext"
const socket = io(import.meta.env.VITE_API_BASE, {
  withCredentials: true
});

const Navbar = () => {
  const { user, logout } = useAuth()
  const isSignedIn = !!user
  const navigate = useNavigate()

  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [openSidebar, setOpenSidebar] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

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
    if (!isSignedIn) return

    const handleNewLecture = (lecture) => {
      setNotifications((prev) => [
        {
          type: "lecture",
          subject: lecture.subject,
          date: lecture.date,
          teacher: lecture.teacher
        },
        ...prev
      ])
    }

    const handleNewAssignment = (assignment) => {
      setNotifications((prev) => [
        {
          type: "assignment",
          title: assignment.title,
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          teacher: assignment.teacher
        },
        ...prev
      ])
    }

    socket.on("newLecture", handleNewLecture)
    socket.on("newAssignment", handleNewAssignment)

    return () => {
      socket.off("newLecture", handleNewLecture)
      socket.off("newAssignment", handleNewAssignment)
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
                    className="relative text-xl text-slate-900 hover:text-indigo-600 transition"
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
                            onClick={() => setNotifications([])}
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
                              key={index}
                              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                            >
                              <p className="text-sm font-medium">
                                {n.type === "assignment"
                                  ? "New Assignment Posted"
                                  : "New Lecture Scheduled"}
                              </p>
                              <p className="text-xs text-white/70 mt-1">
                                {n.title || n.subject}
                              </p>
                              <p className="text-xs text-white/60">
                                By {n.teacher}
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
                      src={user?.image || "https://ui-avatars.com/api/?name=" + user?.name}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {openProfile && (
                    <div className="absolute right-0 mt-4 w-72 backdrop-blur-xl bg-black/90 border border-white/20 shadow-2xl rounded-2xl p-6 text-white">
                      <div className="flex items-center gap-4">
                        <img
                          src={user?.image || "https://ui-avatars.com/api/?name=" + user?.name}
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">
                            {user?.name}
                          </p>
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
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpenSidebar(false)}
        />

        <div
          className={`absolute top-0 left-0 h-full w-72 backdrop-blur-2xl bg-white/70 border-r border-white/30 shadow-2xl p-6 transform transition-transform duration-300 ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-10 text-slate-900">
            <span className="text-lg font-semibold">Menu</span>
            <button onClick={() => setOpenSidebar(false)}>
              <FiX />
            </button>
          </div>

          <div className="space-y-6 text-slate-800 font-medium text-sm">
            <Link to="/dashboard" onClick={() => setOpenSidebar(false)} className="block hover:text-indigo-600 transition">
              Dashboard
            </Link>

            <Link to="/assignments" onClick={() => setOpenSidebar(false)} className="block hover:text-indigo-600 transition">
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