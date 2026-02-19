import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

const GenerateQR = ({ lecture, onClose }) => {
  if (!lecture?._id) return null;

  // 🔥 Only store lecture ID in QR
  const qrValue = lecture._id;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92 }}
          transition={{ duration: 0.25 }}
          className="relative w-[92%] max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl transition"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Scan to Mark Attendance
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            {lecture.subject}
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-inner border">
              <QRCode
                value={qrValue}
                size={260}
                level="H"
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>

          {/* Optional readable ID */}
          <p className="mt-5 text-xs text-gray-400 break-all">
            Lecture ID: {lecture._id}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;
