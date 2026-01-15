import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const QRScanner = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
(decodedText) => {
  const lectureId = decodedText; // ✅ ONLY lecture ID
   localStorage.setItem("currentLecture", lectureId);

  scanner.stop().then(() => {
    navigate("/attendance"); // ✅ NEW PAGE
  });

  const student = JSON.parse(localStorage.getItem("student")) || {};

        if (!student || !lectureId) return;

        const attendance =
          JSON.parse(localStorage.getItem("attendance")) || {};

        if (!attendance[lectureId]) {
          attendance[lectureId] = [];
        }

        const alreadyMarked = attendance[lectureId].some(
          (s) => s.enrollment === student.enrollment
        );

        if (!alreadyMarked) {
          attendance[lectureId].push({
            name: student.name,
            enrollment: student.enrollment,
            time: new Date().toLocaleTimeString(),
          });

          localStorage.setItem(
            "attendance",
            JSON.stringify(attendance)
          );
        }

        scanner.stop().then(() => {
          navigate("/student");
        });
      }
    );

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
