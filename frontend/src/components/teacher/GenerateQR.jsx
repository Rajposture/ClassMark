import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const GenerateQR = ({ lecture, onClose }) => {
  const DURATION = 1200;
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSecondsLeft(DURATION);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lecture, onClose]);

  if (!lecture?._id) return null;

  const attendanceUrl = `${window.location.origin}/verify/${lecture._id}`;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = (secondsLeft / DURATION) * 100;

  const isExpiringSoon = secondsLeft <= 120;

  const handleCopy = () => {
    navigator.clipboard.writeText(attendanceUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={s.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.94, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={s.modal}
        >
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.iconBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="3" height="3" rx="0.5"/>
                  <rect x="18" y="14" width="3" height="3" rx="0.5"/>
                  <rect x="14" y="18" width="3" height="3" rx="0.5"/>
                  <rect x="18" y="18" width="3" height="3" rx="0.5"/>
                </svg>
              </div>
              <div>
                <h2 style={s.title}>Attendance QR Code</h2>
                <p style={s.subtitle}>{lecture.subject}</p>
              </div>
            </div>
            <button onClick={onClose} style={s.closeBtn} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={s.divider} />

          {/* Timer */}
          <div style={s.timerSection}>
            <div style={s.timerRow}>
              <div style={s.timerLeft}>
                <div style={isExpiringSoon ? { ...s.timerDot, ...s.timerDotWarning } : s.timerDot} />
                <span style={isExpiringSoon ? { ...s.timerLabel, color: "#dc2626" } : s.timerLabel}>
                  {isExpiringSoon ? "Expiring soon" : "Session active"}
                </span>
              </div>
              <span style={isExpiringSoon ? { ...s.timerValue, color: "#dc2626" } : s.timerValue}>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Progress bar */}
            <div style={s.progressTrack}>
              <motion.div
                style={{
                  ...s.progressBar,
                  background: isExpiringSoon ? "#dc2626" : "#111827",
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "linear" }}
              />
            </div>
          </div>

          {/* QR Code */}
          <div style={s.qrWrapper}>
            <div style={s.qrInner}>
              {/* Corner decorations */}
              <div style={{ ...s.corner, top: 10, left: 10, borderTop: "2px solid #111827", borderLeft: "2px solid #111827" }} />
              <div style={{ ...s.corner, top: 10, right: 10, borderTop: "2px solid #111827", borderRight: "2px solid #111827" }} />
              <div style={{ ...s.corner, bottom: 10, left: 10, borderBottom: "2px solid #111827", borderLeft: "2px solid #111827" }} />
              <div style={{ ...s.corner, bottom: 10, right: 10, borderBottom: "2px solid #111827", borderRight: "2px solid #111827" }} />

              <QRCode
                value={attendanceUrl}
                size={200}
                level="H"
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>

          {/* Lecture Code */}
          <div style={s.codeContainer}>
            <p style={s.codeLabel}>Lecture Code</p>
            <div style={s.codeBox}>
              {lecture.lectureCode || "----"}
            </div>
            <p style={s.codeHint}>
              Students can enter this code manually if QR scanning is unavailable
            </p>
          </div>

          {/* Info chips */}
          <div style={s.chipsRow}>
            <div style={s.chip}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Scan before {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
            <div style={s.chip}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Students only
            </div>
          </div>

          {/* URL row */}
          <div style={s.urlRow}>
            <span style={s.urlText}>{attendanceUrl}</span>
            <button onClick={handleCopy} style={copied ? { ...s.copyBtn, ...s.copyBtnSuccess } : s.copyBtn}>
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const s = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(6px)",
    padding: "16px",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  modal: {
    width: "100%", maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.18)",
  },
  header: {
    padding: "20px 22px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  iconBox: {
    width: "36px", height: "36px", background: "#f3f4f6",
    borderRadius: "10px", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#374151", flexShrink: 0,
  },
  title: { fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 2px", letterSpacing: "-0.01em" },
  subtitle: { fontSize: "12px", color: "#6b7280", margin: 0 },
  closeBtn: {
    width: "32px", height: "32px", borderRadius: "8px",
    border: "1px solid #e5e7eb", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#6b7280", flexShrink: 0,
    transition: "all 0.15s",
  },
  divider: { height: "1px", background: "#f3f4f6" },

  timerSection: { padding: "14px 22px" },
  timerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" },
  timerLeft: { display: "flex", alignItems: "center", gap: "7px" },
  timerDot: {
    width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e",
    boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
    animation: "pulse 2s infinite",
  },
  timerDotWarning: {
    background: "#dc2626",
    boxShadow: "0 0 0 3px rgba(220,38,38,0.18)",
  },
  timerLabel: { fontSize: "12px", color: "#6b7280", fontWeight: "500" },
  timerValue: { fontSize: "13px", fontWeight: "600", color: "#111827", fontVariantNumeric: "tabular-nums" },
  progressTrack: { height: "3px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: "99px", transition: "background 0.3s" },

  qrWrapper: { padding: "8px 22px 20px", display: "flex", justifyContent: "center" },
  qrInner: {
    position: "relative",
    padding: "20px",
    background: "#ffffff",
    border: "1px solid #f3f4f6",
    borderRadius: "16px",
    display: "inline-flex",
  },
  corner: {
    position: "absolute", width: "14px", height: "14px", borderRadius: "2px",
  },

  // Lecture Code styles
  codeContainer: {
    padding: "0 22px 18px",
    textAlign: "center",
  },
  codeLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    margin: "0 0 8px",
  },
  codeBox: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "10px",
    color: "#111827",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "8px",
    fontVariantNumeric: "tabular-nums",
    fontFamily: "'DM Mono', 'Menlo', monospace",
  },
  codeHint: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
  },

  chipsRow: {
    display: "flex", gap: "8px", justifyContent: "center",
    paddingBottom: "16px",
  },
  chip: {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "5px 10px", background: "#f9fafb",
    border: "1px solid #e5e7eb", borderRadius: "99px",
    fontSize: "11px", fontWeight: "500", color: "#6b7280",
  },

  urlRow: {
    margin: "0 16px 16px",
    display: "flex", alignItems: "center",
    background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: "10px", overflow: "hidden",
  },
  urlText: {
    flex: 1, padding: "9px 12px",
    fontSize: "11px", color: "#9ca3af",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    fontFamily: "'DM Mono', 'Menlo', monospace",
  },
  copyBtn: {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "9px 14px", background: "#111827",
    border: "none", color: "#fff", cursor: "pointer",
    fontSize: "12px", fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0, transition: "all 0.15s",
    borderLeft: "1px solid #e5e7eb",
  },
  copyBtnSuccess: { background: "#16a34a" },
};

export default GenerateQR;