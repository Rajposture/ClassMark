import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";

/* ─── animation states ──────────────────────────────────────────────── */
const STATE = {
  IDLE: "idle",
  SCANNING: "scanning",
  SUCCESS: "success",
  ERROR: "error",
};

/* ─── corner bracket SVG paths ──────────────────────────────────────── */
const corners = [
  { pos: { top: 0, left: 0 },   rotate: 0   },
  { pos: { top: 0, right: 0 },  rotate: 90  },
  { pos: { bottom: 0, right: 0 }, rotate: 180 },
  { pos: { bottom: 0, left: 0 }, rotate: 270 },
];

const QRScanner = () => {
  const navigate    = useNavigate();
  const { user, loading } = useAuth();
  const scannerRef  = useRef(null);
  const [uiState, setUiState] = useState(STATE.IDLE);
  const [errorMsg, setErrorMsg]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* pulse ring count for scanning state */
  const rings = [0, 1, 2];

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (user.role !== "student") { navigate("/teacher-dashboard", { replace: true }); return; }

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices?.length) { setErrorMsg("No camera detected on this device."); setUiState(STATE.ERROR); return; }

        const cam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        setUiState(STATE.SCANNING);

        await scanner.start(
          cam.id,
          { fps: 15, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
          async (decoded) => {
            if (!decoded) return;
            await stopScanner();
            setSuccessMsg("QR code recognised");
            setUiState(STATE.SUCCESS);

            let lectureId;
            try {
              const url = new URL(decoded);
              const parts = url.pathname.split("/");
              lectureId = parts[parts.length - 1];
            } catch { lectureId = decoded; }

            setTimeout(() => navigate(`/verify/${lectureId}`, { replace: true, state: { scanned: true } }), 1600);
          },
          () => {}
        );
      } catch {
        setErrorMsg("Camera permission denied or unavailable.");
        setUiState(STATE.ERROR);
      }
    };

    startScanner();
    return () => { stopScanner(); };
  }, [user, loading, navigate, stopScanner]);

  const isScanning = uiState === STATE.SCANNING;
  const isSuccess  = uiState === STATE.SUCCESS;
  const isError    = uiState === STATE.ERROR;

  return (
    <>
      <style>{css}</style>
      <Navbar />

      {/* ── full-screen canvas ──────────────────────────────────────── */}
      <div style={s.page}>

        {/* subtle dot-grid background */}
        <div style={s.dotGrid} />

        {/* ambient glow blobs – GPU composited, will-change: transform */}
        <div style={s.blob1} />
        <div style={s.blob2} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={s.card}
        >
          {/* ── card header ─────────────────────────────────────── */}
          <div style={s.cardTop}>
            <div style={s.badge}>
              <span style={s.badgeDot(isScanning, isSuccess, isError)} className={isScanning ? "pulse-dot" : ""} />
              <span style={s.badgeText(isScanning, isSuccess, isError)}>
                {isScanning ? "Camera active" : isSuccess ? "Recognised" : isError ? "Error" : "Starting..."}
              </span>
            </div>
          </div>

          {/* ── scanner viewport ────────────────────────────────── */}
          <div style={s.viewportWrap}>

            {/* pulse rings behind the frame (scanning only) */}
            <AnimatePresence>
              {isScanning && rings.map(i => (
                <motion.div
                  key={i}
                  style={s.ring}
                  initial={{ opacity: 0.4, scale: 0.85 }}
                  animate={{ opacity: 0, scale: 1.35 }}
                  transition={{ duration: 2.2, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>

            {/* the actual camera feed div */}
            <div style={s.viewport}>
              <div id="qr-reader" style={s.qrReader} />

              {/* dark overlay vignette */}
              <div style={s.vignette} />

              {/* corner brackets */}
              {corners.map((c, i) => (
                <motion.div
                  key={i}
                  style={{ ...s.cornerWrap, ...c.pos }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: isSuccess ? 0 : 1,
                    scale: isScanning ? 1 : 0.85,
                  }}
                  transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
                    style={{ transform: `rotate(${c.rotate}deg)` }}>
                    <path d="M2 18 L2 2 L18 2" stroke="white" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              ))}

              {/* scan line – CSS animation = zero jank */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    key="scanline"
                    style={s.scanLineTrack}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="scan-line" style={s.scanLine} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SUCCESS overlay ─────────────────────────────── */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    style={s.successOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* ripple burst */}
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        style={s.ripple}
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2.8 + i * 0.6, opacity: 0 }}
                        transition={{ duration: 0.9, delay: i * 0.15, ease: "easeOut" }}
                      />
                    ))}
                    <motion.div
                      style={s.successCircle}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.05 }}
                    >
                      <motion.svg
                        width="36" height="36" viewBox="0 0 24 24"
                        fill="none" stroke="white" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        initial="hidden" animate="visible"
                      >
                        <motion.polyline
                          points="20 6 9 17 4 12"
                          variants={{
                            hidden: { pathLength: 0 },
                            visible: { pathLength: 1, transition: { duration: 0.4, delay: 0.2, ease: "easeOut" } }
                          }}
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── ERROR overlay ────────────────────────────────── */}
              <AnimatePresence>
                {isError && (
                  <motion.div
                    style={s.errorOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div style={s.errorCircle}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── footer text ─────────────────────────────────────── */}
          <div style={s.footer}>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div key="ok" style={s.footerInner}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <div style={s.footerIcon("#dcfce7")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ ...s.footerTitle, color: "#16a34a" }}>QR code detected</p>
                    <p style={s.footerSub}>Redirecting you now...</p>
                  </div>
                </motion.div>
              ) : isError ? (
                <motion.div key="err" style={s.footerInner}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <div style={s.footerIcon("#fee2e2")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ ...s.footerTitle, color: "#dc2626" }}>Camera unavailable</p>
                    <p style={s.footerSub}>{errorMsg}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="scan" style={s.footerInner}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <div style={s.footerIcon("#f3f4f6")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
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
                    <p style={s.footerTitle}>Point camera at the QR code</p>
                    <p style={s.footerSub}>Hold steady — detection is automatic</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

        {/* ── bottom label ────────────────────────────────────────── */}
        <motion.p
          style={s.bottomLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          University Learning Management System &mdash; Attendance
        </motion.p>
      </div>
    </>
  );
};

/* ─── keyframe CSS injected once ──────────────────────────────────────
   Using CSS animations (not JS) for the scan line and dot pulse
   ensures 60 fps on main thread without requestAnimationFrame overhead.
 ─────────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  @keyframes scan {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(256px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }
  @keyframes blob-drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33%       { transform: translate(30px,-20px) scale(1.06); }
    66%       { transform: translate(-20px,10px) scale(0.96); }
  }
  .scan-line {
    animation: scan 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    will-change: transform;
  }
  .pulse-dot {
    animation: pulse-dot 1.8s ease-in-out infinite;
  }
  #qr-reader video {
    object-fit: cover !important;
    border-radius: 0 !important;
  }
  #qr-reader > div, #qr-reader img, #qr-reader button {
    display: none !important;
  }
`;

/* ─── style objects ────────────────────────────────────────────────── */
const font = "'DM Sans', 'Helvetica Neue', sans-serif";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f8f6",
    position: "relative",
    overflow: "hidden",
    fontFamily: font,
    padding: "80px 16px 32px",
    gap: "20px",
  },
  dotGrid: {
    position: "absolute", inset: 0, zIndex: 0,
    backgroundImage: "radial-gradient(circle, #d4d4d0 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    opacity: 0.55,
    pointerEvents: "none",
  },
  blob1: {
    position: "absolute", top: "10%", left: "15%",
    width: "340px", height: "340px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    animation: "blob-drift 9s ease-in-out infinite",
    willChange: "transform",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob2: {
    position: "absolute", bottom: "10%", right: "10%",
    width: "280px", height: "280px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
    animation: "blob-drift 11s ease-in-out infinite reverse",
    willChange: "transform",
    pointerEvents: "none",
    zIndex: 0,
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: "380px",
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  cardTop: {
    padding: "16px 20px 12px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  badge: {
    display: "flex", alignItems: "center", gap: "7px",
    padding: "5px 11px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "99px",
  },
  badgeDot: (scanning, success, error) => ({
    width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
    background: success ? "#22c55e" : error ? "#ef4444" : scanning ? "#22c55e" : "#9ca3af",
  }),
  badgeText: (scanning, success, error) => ({
    fontSize: "12px", fontWeight: "500",
    color: success ? "#16a34a" : error ? "#dc2626" : scanning ? "#15803d" : "#9ca3af",
  }),

  viewportWrap: {
    position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 20px 0",
  },
  ring: {
    position: "absolute",
    width: "280px", height: "280px",
    borderRadius: "18px",
    border: "1.5px solid rgba(99,102,241,0.3)",
    pointerEvents: "none",
    willChange: "transform, opacity",
  },
  viewport: {
    position: "relative",
    width: "300px", height: "300px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#0f0f0f",
  },
  qrReader: {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
  },
  vignette: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none", zIndex: 2,
  },
  cornerWrap: {
    position: "absolute", zIndex: 4,
    width: "28px", height: "28px",
    margin: "12px",
    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))",
  },
  scanLineTrack: {
    position: "absolute", inset: 0, zIndex: 3,
    overflow: "hidden", borderRadius: "16px",
    pointerEvents: "none",
  },
  scanLine: {
    position: "absolute", left: 0, right: 0, top: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.9) 30%, rgba(139,92,246,1) 50%, rgba(99,102,241,0.9) 70%, transparent 100%)",
    boxShadow: "0 0 12px 2px rgba(99,102,241,0.5)",
    willChange: "transform",
  },

  successOverlay: {
    position: "absolute", inset: 0, zIndex: 10,
    background: "rgba(0,0,0,0.72)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "16px",
  },
  ripple: {
    position: "absolute",
    width: "80px", height: "80px", borderRadius: "50%",
    background: "rgba(34,197,94,0.25)",
    willChange: "transform, opacity",
  },
  successCircle: {
    position: "relative",
    width: "72px", height: "72px", borderRadius: "50%",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 0 12px rgba(34,197,94,0.15)",
    willChange: "transform",
  },

  errorOverlay: {
    position: "absolute", inset: 0, zIndex: 10,
    background: "rgba(0,0,0,0.72)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "16px",
  },
  errorCircle: {
    width: "68px", height: "68px", borderRadius: "50%",
    background: "#ef4444",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 0 12px rgba(239,68,68,0.15)",
  },

  footer: {
    padding: "16px 20px 20px",
    borderTop: "1px solid #f3f4f6",
    marginTop: "16px",
  },
  footerInner: {
    display: "flex", alignItems: "flex-start", gap: "12px",
  },
  footerIcon: (bg) => ({
    width: "32px", height: "32px", borderRadius: "8px",
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }),
  footerTitle: {
    fontSize: "13px", fontWeight: "600", color: "#111827",
    margin: "0 0 2px",
  },
  footerSub: {
    fontSize: "12px", color: "#9ca3af", margin: 0,
    lineHeight: "1.5",
  },
  bottomLabel: {
    position: "relative", zIndex: 1,
    fontSize: "11px", color: "#d1d5db",
    letterSpacing: "0.04em",
    textAlign: "center",
    fontWeight: "500",
    textTransform: "uppercase",
  },
};

export default QRScanner;