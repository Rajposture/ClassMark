import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const GenerateQR = ({ lecture, onClose }) => {
  const [qrValue, setQrValue] = useState("");


 
useEffect(() => {
  setQrValue(String(lecture.id));
}, [lecture.id]);

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/60
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          p-6
          w-[320px]
          shadow-2xl
          relative
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-center">
          Attendance QR
        </h2>

        <p className="text-sm text-gray-500 text-center mb-4">
          {lecture.title}
        </p>

        <div className="flex justify-center">
          <QRCodeCanvas value={qrValue} size={200} />
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          QR refreshes every 10 seconds
        </p>
      </div>
    </div>
  );
};

export default GenerateQR;
