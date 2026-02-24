import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const ProfileMenu = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer bg-black text-white px-4 py-2 rounded-full text-sm"
      >
        {user?.name}
      </div>

      {open && (
        <div className="absolute right-0 mt-3 w-40 bg-white shadow-xl rounded-xl border border-gray-200">
          <button
            onClick={() => {
              logout()
              navigate("/login")
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu