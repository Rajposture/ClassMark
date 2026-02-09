import { useEffect, useState, useContext } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import { AuthContext } from "../context/AuthContext"
import API_BASE from "../config/api"

const AttendanceForm = () => {
  const { lectureId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const { user, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate("/login")
      return
    }
    if (user.role !== "student") {
      navigate("/teacher")
    }
  }, [user, loading, navigate])

  const handleSubmit = async () => {
    if (!lectureId || !token) {
      setMessage("Invalid QR. Please scan again.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lectureId, token })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ Attendance submitted successfully")
        setTimeout(() => navigate("/student"), 1500)
      } else {
        setMessage(data.message)
      }
    } catch {
      setMessage("Server error")
    }

    setSubmitting(false)
  }

  if (!lectureId || !token) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Invalid attendance link
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
            Lecture Attendance
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Confirm your details
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Enrollment Number
              </label>
              <input
                type="text"
                value={user?.enrollmentNumber || ""}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
            >
              {submitting ? "Submitting..." : "Submit Attendance"}
            </button>

            {message && (
              <p className="text-center text-sm mt-3 text-gray-700">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AttendanceForm
