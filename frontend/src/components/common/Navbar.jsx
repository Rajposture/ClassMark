import { useContext, useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { FiMenu, FiX, FiLogOut } from "react-icons/fi"
import { IoNotificationsOutline } from "react-icons/io5"
import { io } from "socket.io-client"
import API_BASE from "../../config/api"

const socket = io(API_BASE)

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const fileInputRef = useRef(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [openSidebar, setOpenSidebar] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  )
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
    if (!user) return

    const handleNewLecture = (lecture) => {
      if (user.role === "student") {
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
    }

    const handleNewAssignment = (assignment) => {
      if (user.role === "student") {
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
    }

    socket.on("newLecture", handleNewLecture)
    socket.on("newAssignment", handleNewAssignment)

    return () => {
      socket.off("newLecture", handleNewLecture)
      socket.off("newAssignment", handleNewAssignment)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
      localStorage.setItem("profileImage", reader.result)
    }
    reader.readAsDataURL(file)
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : ""

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-7xl backdrop-blur-2xl bg-white/60 border border-white/30 shadow-xl rounded-2xl px-6 py-3 flex justify-between items-center">

          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-xl text-slate-700"
              onClick={() => setOpenSidebar(true)}
            >
              <FiMenu />
            </button>

            <span className="text-xl font-semibold tracking-tight text-slate-900">
              ClassMark
            </span>
          </div>

          {user && (
            <div className="hidden md:flex gap-8 text-slate-700 font-medium text-sm">
              <Link to={user.role === "teacher" ? "/teacher" : "/student"} className="hover:text-black transition">
                Dashboard
              </Link>
              <Link to="/lectures" className="hover:text-black transition">
                Lectures
              </Link>
              <Link to="/assignments" className="hover:text-black transition">
                Assignments
              </Link>
              <Link to="/mis" className="hover:text-black transition">
                MIS
              </Link>
            </div>
          )}

          <div className="flex items-center gap-6">

            {!user && (
              <Link
                to="/login"
                className="px-5 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 transition"
              >
                Login
              </Link>
            )}

            {user && (
              <>
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setOpenNotifications(!openNotifications)}
                    className="relative text-xl text-slate-700 hover:text-black transition"
                  >
                    <IoNotificationsOutline />
                    {notifications.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {openNotifications && (
                    <div
                      className="
                        absolute md:right-0 md:w-80
                        left-0 right-0 md:left-auto
                        mt-4
                        w-full md:max-h-96
                        max-h-[70vh]
                        overflow-y-auto
                        backdrop-blur-xl bg-white/90
                        border border-white/40
                        shadow-2xl
                        rounded-2xl
                        p-4
                      "
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">
                          Notifications
                        </h3>

                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No new notifications
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((n, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                            >
                              <p className="text-sm font-medium text-slate-800">
                                {n.type === "assignment"
                                  ? "New Assignment Posted"
                                  : "New Lecture Scheduled"}
                              </p>

                              <p className="text-xs text-slate-600 mt-1">
                                {n.title || n.subject}
                              </p>

                              {n.dueDate && (
                                <p className="text-xs text-slate-500">
                                  Due {n.dueDate}
                                </p>
                              )}

                              {n.date && (
                                <p className="text-xs text-slate-500">
                                  {n.date}
                                </p>
                              )}

                              <p className="text-xs text-slate-500">
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
                    className="w-10 h-10 rounded-full bg-white/80 border border-slate-300 flex items-center justify-center text-sm font-semibold text-slate-700 cursor-pointer overflow-hidden backdrop-blur-md shadow-sm"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {openProfile && (
                    <div className="absolute right-0 mt-4 w-72 backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-slate-700">
                              {initials}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-500 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="mt-5 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm transition"
                      >
                        Change Photo
                      </button>

                      <button
                        onClick={handleLogout}
                        className="mt-3 w-full py-2 rounded-lg bg-black text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpenSidebar(false)}
        />

        <div
          className={`absolute top-0 left-0 h-full w-72 backdrop-blur-2xl bg-white/70 border-r border-white/40 shadow-2xl p-6 transform transition-transform duration-300 ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-10">
            <span className="text-lg font-semibold text-slate-800">
              Menu
            </span>
            <button onClick={() => setOpenSidebar(false)}>
              <FiX />
            </button>
          </div>

          <div className="space-y-6 text-slate-700 font-medium text-sm">
            <Link to={user?.role === "teacher" ? "/teacher" : "/student"} onClick={() => setOpenSidebar(false)} className="block hover:text-black transition">
              Dashboard
            </Link>
            <Link to="/lectures" onClick={() => setOpenSidebar(false)} className="block hover:text-black transition">
              Lectures
            </Link>
            <Link to="/assignments" onClick={() => setOpenSidebar(false)} className="block hover:text-black transition">
              Assignments
            </Link>
            <Link to="https://lssimss.com/GPMMIS/jsp/userlogin.action" onClick={() => setOpenSidebar(false)} className="block hover:text-black transition">
              MIS
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
