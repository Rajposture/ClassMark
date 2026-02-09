import { useContext, useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

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
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6">
        <nav className="w-full max-w-7xl bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl px-5 sm:px-8 py-3 sm:py-4 flex justify-between items-center border">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-xl"
              onClick={() => setOpenSidebar(true)}
            >
              ☰
            </button>

            <img src="/favicon.png" alt="logo" className="w-8 h-8 sm:w-9 sm:h-9" />

            <span className="text-lg sm:text-xl font-bold text-indigo-600">
              ClassMark
            </span>
          </div>

          {/* DESKTOP NAV */}
          {user && (
            <div className="hidden md:flex gap-10 text-slate-700 font-medium">
              <Link
                to={user.role === "teacher" ? "/teacher" : "/student"}
                className="hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>

              <Link
                to="/lectures"
                className="hover:text-indigo-600 transition"
              >
                Lectures
              </Link>

              <Link
                to="/assignments"
                className="hover:text-indigo-600 transition"
              >
                Assignments
              </Link>

              <Link
                to="/mis"
                className="hover:text-indigo-600 transition"
              >
                MIS
              </Link>
            </div>
          )}

          {/* RIGHT */}
          <div className="flex items-center gap-4 sm:gap-6">
            {!user && (
              <Link
                to="/login"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Login
              </Link>
            )}

            {user && (
              <div ref={dropdownRef} className="relative">
                <div
                  onClick={() => setOpenProfile(!openProfile)}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center font-semibold text-indigo-600 cursor-pointer overflow-hidden"
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
                  <div className="absolute right-0 mt-4 w-72 bg-white shadow-2xl rounded-xl p-6 border">

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full border overflow-hidden">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-indigo-600">
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
                          <p className="text-sm text-slate-500">
                            Enrollment: {user.enrollmentNumber}
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
                      className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm"
                    >
                      Change Profile Photo
                    </button>

                    <button
                      onClick={handleLogout}
                      className="mt-3 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* MOBILE SIDEBAR */}
      {/* MOBILE SIDEBAR */}
<div
  className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
    openSidebar ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
>
  {/* Overlay */}
  <div
    className="absolute inset-0 bg-black/50"
    onClick={() => setOpenSidebar(false)}
  />

  {/* Drawer */}
  <div
    className={`absolute top-0 left-0 h-full w-72 bg-white shadow-2xl p-6 transform transition-transform duration-300 ${
      openSidebar ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <div className="flex justify-between items-center mb-8">
      <span className="text-lg font-bold text-indigo-600">
        Menu
      </span>
      <button onClick={() => setOpenSidebar(false)}>✕</button>
    </div>

    <div className="space-y-6 font-medium text-slate-700">
      <Link
        to={user?.role === "teacher" ? "/teacher" : "/student"}
        onClick={() => setOpenSidebar(false)}
        className="block hover:text-indigo-600"
      >
        Dashboard
      </Link>

      <Link
        to="/lectures"
        onClick={() => setOpenSidebar(false)}
        className="block hover:text-indigo-600"
      >
        Lectures
      </Link>

      <Link
        to="/assignments"
        onClick={() => setOpenSidebar(false)}
        className="block hover:text-indigo-600"
      >
        Assignments
      </Link>

      <Link
        to="/mis"
        onClick={() => setOpenSidebar(false)}
        className="block hover:text-indigo-600"
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
