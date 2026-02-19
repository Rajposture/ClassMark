import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

const GenerateQR = ({ lecture, onClose }) => {
  if (!lecture?._id) return null;

  const attendanceUrl = `${window.location.origin}/attendance/${lecture._id}`;

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
          className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-gray-200"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl transition"
          >
            ✕
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Mark Attendance
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {lecture.subject}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
              <QRCode
                value={attendanceUrl}
                size={220}
                level="H"
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>

          <div className="mt-6 bg-gray-100 rounded-xl p-3 text-xs text-gray-600 break-all">
            {attendanceUrl}
          </div>

          <div className="mt-5 text-xs text-gray-400">
            QR valid only for active session
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;
