import { useState, useEffect, useContext } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import API_BASE from "../config/api"

const AttendanceForm = () => {
  const { lectureId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const { user, loading: authLoading } = useContext(AuthContext)

  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true })
    }
  }, [authLoading, user, navigate])

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setMessage("")
      },
      () => {
        setMessage("Location permission denied")
      },
      { enableHighAccuracy: true }
    )
  }

 const submitAttendance = async () => {
  if (!latitude || !longitude) {
    setMessage("Please set your location first")
    return
  }

  if (!user) {
    setMessage("Please login again")
    return
  }

  setLoading(true)

  try {
    const res = await fetch(`${API_BASE}/api/attendance/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        lectureId,
        token,
        latitude,
        longitude,
        studentId: user.id,
        name: user.name,
        enrollmentNumber: user.enrollmentNumber
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.message)
    } else {
      setMessage("Attendance marked successfully ✅")
    }

  } catch {
    setMessage("Server error")
  }

  setLoading(false)
}


  if (authLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Lecture Attendance
        </h2>

        <div className="mb-6 bg-slate-50 p-4 rounded-lg text-sm">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Enrollment No:</strong> {user?.enrollmentNumber}</p>
        </div>

        <button
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 bg-slate-700 text-white rounded-lg"
        >
          Set Current Location
        </button>

        <button
          onClick={submitAttendance}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}

export default AttendanceForm
