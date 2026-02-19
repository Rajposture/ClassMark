import { Html5Qrcode } from "html5-qrcode"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../common/Navbar"

const QRScanner = () => {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()

        if (!devices || devices.length === 0) {
          setError("No camera found")
          return
        }

        const backCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || devices[0]

        const scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner

        await scanner.start(
          backCamera.id,
          {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (!decodedText) return

            scanner.stop().catch(() => {})

            navigate("/attendance", {
              state: { token: decodedText }
            })
          },
          () => {}
        )
      } catch (err) {
        console.error("Camera error:", err)
        setError("Camera permission denied or unavailable")
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [navigate])

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div
            id="qr-reader"
            className="w-[320px] h-[320px] bg-black rounded-xl shadow-lg"
          />
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default QRScanner
