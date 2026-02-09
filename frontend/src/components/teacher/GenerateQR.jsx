import { useEffect, useState } from "react"
import { QRCode } from "react-qrcode-logo"
import API_BASE from "../../config/api"

const GenerateQR = ({ lecture, onClose }) => {
  const [qrValue, setQrValue] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval

    const fetchQR = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${API_BASE}/api/lectures/${lecture._id}/qr`,
          { credentials: "include" }
        )

        if (!res.ok) {
          console.log("QR API failed:", res.status)
          setQrValue("")
          return
        }

        const data = await res.json()

        if (!data.token) {
          console.log("No token received")
          setQrValue("")
          return
        }

        const baseURL = window.location.origin
        const attendanceURL =
          `${baseURL}/attendance/${lecture._id}?token=${data.token}`

        console.log("QR Generated:", attendanceURL)

        setQrValue(attendanceURL)

      } catch (err) {
        console.log("QR ERROR:", err)
        setQrValue("")
      } finally {
        setLoading(false)
      }
    }

    fetchQR()
    interval = setInterval(fetchQR, 20000)

    return () => clearInterval(interval)
  }, [lecture._id])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-2">
          Secure Attendance QR
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          {lecture.subject}
        </p>

        <div className="flex justify-center min-h-[300px] items-center">
          {loading && <p className="text-gray-400">Generating QR...</p>}

          {!loading && qrValue && (
            <QRCode
              value={qrValue}
              size={280}
              ecLevel="H"
              fgColor="#111827"
              bgColor="#ffffff"
              logoImage="/favicon.png"
              logoWidth={45}
              logoHeight={45}
              removeQrCodeBehindLogo={true}
              quietZone={12}
            />
          )}

          {!loading && !qrValue && (
            <p className="text-red-400">Failed to generate QR</p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          QR refreshes every 90 seconds
        </p>

      </div>
    </div>
  )
}

export default GenerateQR
