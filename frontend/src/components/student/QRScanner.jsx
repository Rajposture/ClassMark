import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const { user, loading } = useAuth();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "student") {
      navigate("/teacher-dashboard", { replace: true });
      return;
    }

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          setError("No camera found");
          return;
        }

        const backCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || devices[0];

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        setScanning(true);

        await scanner.start(
          backCamera.id,
          {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            if (!decodedText) return;

            try {
              await scanner.stop();
            } catch {}

            setScanning(false);

            let lectureId;

            try {
              const url = new URL(decodedText);
              const parts = url.pathname.split("/");
              lectureId = parts[parts.length - 1];
            } catch {
              lectureId = decodedText;
            }

            // Small delay for smooth transition
            setTimeout(() => {
              navigate(`/verify/${lectureId}`, {
                replace: true,
                state: { scanned: true }
              });
            }, 300);
          },
          () => {}
        );
      } catch {
        setError("Camera permission denied or unavailable");
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [user, loading, navigate]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col items-center bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8"
        >
          <div className="relative">
            <div
              id="qr-reader"
              className="w-[320px] h-[320px] rounded-2xl overflow-hidden"
            />

            {scanning && (
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: 280 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.8,
                  ease: "easeInOut"
                }}
                className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
              />
            )}
          </div>

          <p className="mt-6 text-gray-600 text-sm text-center">
            Align the QR code inside the frame
          </p>

          {error && (
            <p className="mt-4 text-red-600 text-sm text-center">
              {error}
            </p>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default QRScanner;