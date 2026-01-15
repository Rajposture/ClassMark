import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const QRScanner = () => {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const isStartedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
  const lectureId = String(decodedText);

  localStorage.setItem("currentLecture", lectureId);

  scanner.stop().finally(() => {
    navigate(`/attendance/${lectureId}`);
  });
}
      )
      .then(() => {
        isStartedRef.current = true;
      })
      .catch((err) => {
        console.error("QR start error:", err);
      });

    return () => {
      // 🔥 cleanup — stop ONLY if running
      if (scannerRef.current && isStartedRef.current) {
        scannerRef.current.stop().catch(() => {});
        isStartedRef.current = false;
      }
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
