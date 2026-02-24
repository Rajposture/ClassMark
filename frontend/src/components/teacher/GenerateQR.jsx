import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const GenerateQR = ({ lecture, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(1200);

  useEffect(() => {
    setSecondsLeft(1200);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lecture, onClose]);

  if (!lecture?._id) return null;

  // 🔥 Updated QR URL
const attendanceUrl = `${window.location.origin}/verify/${lecture._id}`;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-2">
            Attendance QR
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Expires in {minutes}:{seconds.toString().padStart(2, "0")}
          </p>

          <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner">
            <QRCode
              value={attendanceUrl}
              size={220}
              level="H"
              bgColor="#ffffff"
              fgColor="#111827"
            />
          </div>

          <div className="mt-4 text-xs text-gray-400 break-all">
            {attendanceUrl}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;