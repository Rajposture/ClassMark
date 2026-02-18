import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import API_BASE from "../../config/api";

const GenerateQR = ({ lecture, onClose }) => {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lecture?._id) return;

    let refreshInterval;
    let countdownInterval;

    const fetchQR = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Not authenticated");
          return;
        }

        const res = await fetch(
          `${API_BASE}/api/lectures/${lecture._id}/qr`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.token) {
          setError(data.message || "QR generation failed");
          return;
        }

        const attendanceURL =
          `${window.location.origin}/attendance/${lecture._id}?token=${data.token}`;

        setQrValue(attendanceURL);
        setSecondsLeft(600);
      } catch (err) {
        console.log("QR error:", err);
        setError("Server connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();

    refreshInterval = setInterval(fetchQR, 540000);

    countdownInterval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [lecture]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-center mb-2">
          Secure Attendance QR
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6 truncate">
          {lecture?.subject}
        </p>

        <div className="flex justify-center min-h-[250px] items-center">
          {loading && <p>Generating QR...</p>}

          {!loading && qrValue && (
            <QRCode
              value={qrValue}
              size={260}
              ecLevel="H"
              fgColor="#111827"
              bgColor="#ffffff"
              quietZone={10}
            />
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Expires in: {formatTime(secondsLeft)}
        </p>
      </div>
    </div>
  );
};

export default GenerateQR;
