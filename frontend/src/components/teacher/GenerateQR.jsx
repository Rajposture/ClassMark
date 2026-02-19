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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center"
        >
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

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-inner border">
              <QRCode
                value={attendanceUrl}
                size={220}
                level="H"
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>

          <p className="mt-5 text-xs text-gray-500 break-all">
            {attendanceUrl}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;
