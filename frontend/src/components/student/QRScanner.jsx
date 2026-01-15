import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const QRScanner = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          const lectureId = String(decodedText); // ✅ plain lectureId

          // Save lectureId for attendance form
          localStorage.setItem("currentLecture", lectureId);

          // Stop scanner BEFORE navigating
          scanner.stop().then(() => {
            navigate("/attendance");
          });
        }
      )
      .catch((err) => {
        console.error("QR Scan Error:", err);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div
          id="qr-reader"
          className="w-[300px] h-[300px] bg-black rounded"
        />
      </div>
    </>
  );
};

export default QRScanner;
