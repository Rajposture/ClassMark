import { useContext, useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi"
import { IoNotificationsOutline } from "react-icons/io5"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [openSidebar, setOpenSidebar] = useState(false)
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  )

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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
      {/* NAVBAR */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-7xl backdrop-blur-2xl bg-white/60 border border-white/30 shadow-xl rounded-2xl px-6 py-3 flex justify-between items-center">

          {/* LEFT */}
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

          {/* DESKTOP NAV */}
          {user && (
            <div className="hidden md:flex gap-8 text-slate-700 font-medium text-sm">
              <Link
                to={user.role === "teacher" ? "/teacher" : "/student"}
                className="hover:text-black transition"
              >
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

          {/* RIGHT */}
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
                {/* Notification Icon (Professional, no emoji) */}
                <button className="text-xl text-slate-700 hover:text-black transition">
                  <IoNotificationsOutline />
                </button>

                {/* PROFILE */}
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
                            <img
                              src={profileImage}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
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
                          {user.role === "student" && (
                            <p className="text-xs text-slate-500">
                              {user.enrollmentNumber}
                            </p>
                          )}
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

      {/* MOBILE SIDEBAR */}
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
            <Link
              to={user?.role === "teacher" ? "/teacher" : "/student"}
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-black transition"
            >
              Dashboard
            </Link>

            <Link
              to="/lectures"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-black transition"
            >
              Lectures
            </Link>

            <Link
              to="/assignments"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-black transition"
            >
              Assignments
            </Link>

            <Link
              to="/mis"
              onClick={() => setOpenSidebar(false)}
              className="block hover:text-black transition"
            >
              MIS
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
