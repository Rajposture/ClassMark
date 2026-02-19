import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import API_BASE from "../../config/api";

const GenerateQR = ({ lecture, onClose }) => {
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
const res = await fetch(
  `${API_BASE}/api/lectures/${lecture._id}/qr`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to generate QR");
          return;
        }

        const url = `${window.location.origin}/attendance/${data.token}`;
        setQrUrl(url);

      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    if (lecture?._id) {
      fetchQR();
    }
  }, [lecture]);

  if (!lecture?._id) return null;

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

          <h2 className="text-2xl font-semibold mb-4">Mark Attendance</h2>

          {loading && <p>Generating QR...</p>}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && qrUrl && (
            <>
              <div className="flex justify-center mt-4">
                <QRCode value={qrUrl} size={220} />
              </div>

              <div className="mt-4 text-xs break-all">
                {qrUrl}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateQR;
