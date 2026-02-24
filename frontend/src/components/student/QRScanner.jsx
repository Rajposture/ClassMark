import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";

const QRScanner = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scannerRef = useRef(null);
  const { user, loading } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const lectureId = searchParams.get("lectureId");
    if (lectureId) {
      navigate(`/verify/${lectureId}`);
    }
  }, [searchParams, navigate]);

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

await scanner.start(
  backCamera.id,
  {
    fps: 15,
    qrbox: { width: 280, height: 280 },
    aspectRatio: 1.0
  },
(decodedText) => {
  if (!decodedText) return;

  scanner.stop().catch(() => {});

  try {
    const url = new URL(decodedText);
    const lectureId = url.pathname.split("/verify/")[1];

    if (lectureId) {
      navigate(`/verify/${lectureId}`);
    }
  } catch {
    console.error("Invalid QR format");
  }
},
  () => {}
);
      } catch (err) {
        setError("Camera permission denied or unavailable");
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

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8"
        >
          <div
            id="qr-reader"
            className="w-[320px] h-[320px] bg-black rounded-2xl shadow-lg"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-600 text-center"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default QRScanner;