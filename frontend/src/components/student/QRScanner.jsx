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
        { facingMode: "environment" }, // ✅ BACK CAMERA ONLY
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: true,
        },
        (decodedText) => {
          console.log("QR detected:", decodedText);

          scanner.stop().then(() => {
            navigate("/student"); // or attendance page
          });
        },
        (error) => {
          // silent error (important)
        }
      );

    return () => {
      scanner
        .stop()
        .catch(() => {});
    };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>

        {/* CAMERA ONLY – NO FILE UPLOAD */}
        <div
          id="qr-reader"
          className="w-[300px] h-[300px] rounded-lg overflow-hidden bg-black"
        />
      </div>
    </>
  );
};

export default QRScanner;
