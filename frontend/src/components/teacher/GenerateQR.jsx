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
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-6">
            Mark Attendance
          </h2>

          <div className="flex justify-center">
            <QRCode
              value={attendanceUrl}
              size={220}
              level="H"
            />
          </div>

          <div className="mt-4 text-xs text-gray-500 break-all">
            {attendanceUrl}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;