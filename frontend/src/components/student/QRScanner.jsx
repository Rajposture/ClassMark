import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const handleScan = (decodedText) => {
      try {
        if (!decodedText) return;

        // ✅ If QR contains full URL
        if (decodedText.startsWith("http")) {
          window.location.href = decodedText;
          return;
        }

        // ✅ If QR contains only lectureId
        navigate(`/attendance/${decodedText}`);
      } catch (err) {
        console.log("Invalid QR format");
      }
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan
      )
      .then(() => {
        isStartedRef.current = true;
      })
      .catch((err) => {
        console.error("QR start error:", err);
      });

    return () => {
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
          className="w-[300px] h-[300px] bg-black rounded-xl shadow-lg"
        />
      </div>
    </>
  );
};

export default QRScanner;
