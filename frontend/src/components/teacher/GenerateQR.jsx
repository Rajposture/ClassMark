import { useEffect, useState } from "react"
import { QRCode } from "react-qrcode-logo"
import API_BASE from "../../config/api"

const GenerateQR = ({ lecture, onClose }) => {
  const [qrValue, setQrValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [error, setError] = useState("")
  const [qrSize, setQrSize] = useState(280)
  const [logoSize, setLogoSize] = useState(45)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setQrSize(220)
        setLogoSize(35)
      } else {
        setQrSize(280)
        setLogoSize(45)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!lecture || !lecture._id) return

    let refreshInterval
    let countdownInterval

    const fetchQR = async () => {
      try {
        setLoading(true)
        setError("")
        setQrValue("")

        const res = await fetch(
          `${API_BASE}/api/lectures/${lecture._id}/qr`,
          {
            method: "GET",
            credentials: "include",
          }
        )

        if (!res.ok) {
          const text = await res.text()
          setError(text || "QR generation failed")
          return
        }

        const data = await res.json()

        if (!data || !data.token) {
          setError("Token not received from backend")
          return
        }

        const attendanceURL =
          `${window.location.origin}/attendance/${lecture._id}?token=${data.token}`

        console.log("QR URL:", attendanceURL)

        setQrValue(attendanceURL)
        setSecondsLeft(600)
      } catch (err) {
        console.log("QR error:", err)
        setError("Server connection failed")
      } finally {
        setLoading(false)
      }
    }

    fetchQR()

    refreshInterval = setInterval(fetchQR, 540000)

    countdownInterval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [lecture])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg sm:text-xl font-semibold text-center mb-2">
          Secure Attendance QR
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6 truncate">
          {lecture?.subject || "Lecture"}
        </p>

        <div className="flex justify-center min-h-[250px] sm:min-h-[300px] items-center">
          {loading && <p className="text-gray-400">Generating QR...</p>}

          {!loading && qrValue && (
            <QRCode
              value={qrValue}
              size={qrSize}
              ecLevel="H"
              fgColor="#111827"
              bgColor="#ffffff"
              logoImage="/favicon.png"
              logoWidth={logoSize}
              logoHeight={logoSize}
              removeQrCodeBehindLogo
              quietZone={12}
            />
          )}

          {!loading && !qrValue && error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Expires in: {formatTime(secondsLeft)}
        </p>

      </div>
    </div>
  )
}

export default GenerateQR
