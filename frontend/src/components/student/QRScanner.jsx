import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const QRScanner = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode("qr-reader");

    qrCodeScanner
      .start(
        { facingMode: "environment" }, // ✅ back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log("QR scanned:", decodedText);

          // stop camera after successful scan
          qrCodeScanner.stop().then(() => {
            navigate(`/attendance/${encodeURIComponent(decodedText)}`);
          });
        },
        () => {
          // ignore scan errors
        }
      )
      .catch((err) => {
        console.error("Camera start failed", err);
      });

    return () => {
      qrCodeScanner.stop().catch(() => {});
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">
          Scan Attendance QR
        </h1>
        <p className="text-slate-500 mb-6">
          Point your camera at the QR code
        </p>

        {/* 🔥 Camera only – no upload option */}
        <div
          id="qr-reader"
          className="mx-auto w-[300px] rounded-xl overflow-hidden shadow bg-black"
        />
      </div>
    </div>
  );
};

export default QRScanner;

