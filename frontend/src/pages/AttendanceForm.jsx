import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";


const STEP = { IDLE: "idle", LOCATING: "locating", LOCATED: "located", SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error" };

const AttendanceForm = () => {
  const navigate      = useNavigate();
 const { lectureId, lectureCode } = useParams();
  const { user, loading } = useAuth();

  const [student,   setStudent]   = useState(null);
  const [latitude,  setLatitude]  = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [step,      setStep]      = useState(STEP.IDLE);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [attendanceMethod, setAttendanceMethod] = useState("QR Scan");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (user.role !== "student") { navigate("/teacher-dashboard", { replace: true }); return; }
    setStudent(user);
  }, [user, loading, navigate]);

  useEffect(() => {
  if (lectureCode) {
    setAttendanceMethod("Lecture Code");
  } else {
    setAttendanceMethod("QR Scan");
  }
}, [lectureCode]);

  const handleSetLocation = () => {
    if (!navigator.geolocation) { setErrorMsg("Geolocation is not supported by this browser."); setStep(STEP.ERROR); return; }
    setStep(STEP.LOCATING);
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setStep(STEP.LOCATED); },
      ()    => { setErrorMsg("Location access was denied. Please allow it in your browser settings."); setStep(STEP.ERROR); },
      { enableHighAccuracy: true }
    );
  };

  const submitAttendance = async () => {
    if (latitude === null || longitude === null)  { setErrorMsg("Please capture your location first."); return; }
    setStep(STEP.SUBMITTING); setErrorMsg("");
    try {
      const endpoint = lectureCode
  ? "/attendance/mark-by-code"
  : "/attendance/mark";

const payload = lectureCode
  ? {
      lectureCode,
      latitude,
      longitude,
      enrollment: student.enrollment
    }
  : {
      lectureId,
      latitude,
      longitude,
      enrollment: student.enrollment
    };

const res = await api.post(endpoint, payload);
      if (res.status !== 201) { setErrorMsg(res.data?.message || "Failed to mark attendance."); setStep(STEP.LOCATED); }
      else {
        setStep(STEP.SUCCESS);
        setTimeout(() => navigate("/student-dashboard", { replace: true }), 2200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "A server error occurred. Please try again.");
      setStep(STEP.LOCATED);
    }
  };

  const isLocating   = step === STEP.LOCATING;
  const isLocated    = step === STEP.LOCATED || step === STEP.SUBMITTING;
  const isSubmitting = step === STEP.SUBMITTING;
  const isSuccess    = step === STEP.SUCCESS;
  const isError      = step === STEP.ERROR;

  if (!student) return <LoadingScreen />;

  return (
    <>
      <style>{css}</style>

      <div style={s.page}>
        <div style={s.dotGrid} />
        <div style={s.blob1} />
        <div style={s.blob2} />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={s.card}
        >
       
          <div style={s.cardHeader}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <polyline points="16 11 18 13 22 9"/>
                </svg>
              </div>
              <div>
  <h1 style={s.headerTitle}>Mark Attendance</h1>

  <p style={s.headerSub}>
    Verify your presence for this session
  </p>

  <div
    style={{
      marginTop: "6px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "999px",
      background: "#f3f4f6",
      fontSize: "11px",
      fontWeight: "600",
      color: "#374151"
    }}
  >
    {lectureCode
      ? `Lecture Code • ${lectureCode}`
      : "QR Attendance"}
  </div>
</div>
            </div>
            <StatusPill step={step} />
          </div>

          <div style={s.divider} />

          <motion.div
            style={s.infoCard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div style={s.avatarWrap}>
              <div style={s.avatar}>
                {student.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p style={s.studentName}>{student.name}</p>
                <p style={s.studentEnroll}>{student.enrollment}</p>
              </div>
            </div>

            <div style={s.infoGrid}>
              <InfoCell label="Department" value={student.department || "—"} />
              <InfoCell label="Semester"   value={student.semester   ? `Sem ${student.semester}` : "—"} />
              <InfoCell label="Session"    value="Present" accent="#16a34a" />
              <InfoCell label="Method" value={attendanceMethod}/>
            </div>
          </motion.div>

          <div style={s.stepRow}>
            <StepDot n={1} done={isLocated || isSubmitting || isSuccess} active={isLocating} label="Location" />
            <div style={s.stepLine(isLocated || isSubmitting || isSuccess)} />
            <StepDot n={2} done={isSuccess} active={isSubmitting} label="Submit" />
            <div style={s.stepLine(isSuccess)} />
            <StepDot n={3} done={isSuccess} active={false} label="Confirmed" />
          </div>

          {/* ── action area ─────────────────────────────────── */}
          <div style={s.actions}>

            {/* Location button */}
            <button
              onClick={isLocated || isSubmitting || isSuccess ? undefined : handleSetLocation}
              disabled={isLocating || isSubmitting || isSuccess}
              style={
                isLocated ? { ...s.btn, ...s.btnSuccess } :
                isLocating ? { ...s.btn, ...s.btnLoading } :
                isSuccess  ? { ...s.btn, ...s.btnSuccess } :
                { ...s.btn, ...s.btnOutline }
              }
            >
              <AnimatePresence mode="wait">
                {isLocating ? (
                  <motion.span key="locating" style={s.btnInner}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <svg className="spin-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Detecting location...
                  </motion.span>
                ) : isLocated || isSuccess ? (
                  <motion.span key="located" style={s.btnInner}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Location verified
                  </motion.span>
                ) : (
                  <motion.span key="idle" style={s.btnInner}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                    </svg>
                    Capture My Location
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Coordinate chip */}
            <AnimatePresence>
              {isLocated && latitude && (
                <motion.div
                  style={s.coordChip}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: "8px" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={s.coordText}>{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              onClick={isLocated ? submitAttendance : undefined}
              disabled={!isLocated || isSubmitting || isSuccess}
              style={
                isSuccess   ? { ...s.btn, ...s.btnDark, marginTop: "10px" } :
                isSubmitting ? { ...s.btn, ...s.btnDark, opacity: 0.7, marginTop: "10px" } :
                isLocated   ? { ...s.btn, ...s.btnDark, marginTop: "10px" } :
                { ...s.btn, ...s.btnDisabled, marginTop: "10px" }
              }
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.span key="sub" style={s.btnInner}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <svg className="spin-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Submitting...
                  </motion.span>
                ) : isSuccess ? (
                  <motion.span key="done" style={s.btnInner}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Attendance confirmed
                  </motion.span>
                ) : (
                  <motion.span key="ready" style={s.btnInner}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Submit Attendance
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Error banner */}
            <AnimatePresence>
              {(errorMsg || isError) && (
                <motion.div
                  style={s.errorBanner}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errorMsg || "An error occurred."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── success overlay ─────────────────────────────── */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                style={s.successOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div key={i} style={s.ripple}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 3 + i * 0.8, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.18, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  style={s.successCircle}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
                >
                  <motion.svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial="hidden" animate="visible">
                    <motion.polyline points="20 6 9 17 4 12"
                      variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 0.45, delay: 0.18, ease: "easeOut" } } }}
                    />
                  </motion.svg>
                </motion.div>
                <motion.p style={s.successLabel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  Attendance recorded
                </motion.p>
                <motion.p style={s.successSub}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Redirecting to dashboard...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        <motion.p style={s.bottomLabel}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          University Learning Management System
        </motion.p>
      </div>
    </>
  );
};

/* ─── sub-components ─────────────────────────────────────────────────── */

const StatusPill = ({ step }) => {
  const map = {
    [STEP.IDLE]:       { label: "Pending",    bg: "#f9fafb", color: "#9ca3af", dot: "#d1d5db" },
    [STEP.LOCATING]:   { label: "Locating",   bg: "#eff6ff", color: "#3b82f6", dot: "#3b82f6" },
    [STEP.LOCATED]:    { label: "Ready",      bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    [STEP.SUBMITTING]: { label: "Submitting", bg: "#fafaf9", color: "#78716c", dot: "#a8a29e" },
    [STEP.SUCCESS]:    { label: "Confirmed",  bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    [STEP.ERROR]:      { label: "Error",      bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  };
  const { label, bg, color, dot } = map[step] || map[STEP.IDLE];
  const pulse = step === STEP.LOCATING || step === STEP.LOCATED || step === STEP.SUCCESS;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "5px 11px", background: bg, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "99px" }}>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: dot }} className={pulse ? "pulse-dot" : ""} />
      <span style={{ fontSize: "12px", fontWeight: "500", color }}>{label}</span>
    </div>
  );
};

const InfoCell = ({ label, value, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
    <span style={{ fontSize: "10px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
    <span style={{ fontSize: "13px", fontWeight: "500", color: accent || "#374151" }}>{value}</span>
  </div>
);

const StepDot = ({ n, done, active, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
    <motion.div
      style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: done ? "#111827" : active ? "#eff6ff" : "#f3f4f6",
        border: active ? "2px solid #3b82f6" : done ? "none" : "1.5px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s",
      }}
      animate={active ? { boxShadow: ["0 0 0 0 rgba(59,130,246,0.4)", "0 0 0 6px rgba(59,130,246,0)"] } : {}}
      transition={active ? { duration: 1.4, repeat: Infinity } : {}}
    >
      {done ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <span style={{ fontSize: "11px", fontWeight: "600", color: active ? "#3b82f6" : "#9ca3af" }}>{n}</span>
      )}
    </motion.div>
    <span style={{ fontSize: "10px", fontWeight: "500", color: done ? "#374151" : active ? "#3b82f6" : "#9ca3af", letterSpacing: "0.02em" }}>{label}</span>
  </div>
);

const LoadingScreen = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", fontFamily: font }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div className="spin-icon" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #e5e7eb", borderTopColor: "#111827" }} />
      <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Loading session...</p>
    </div>
  </div>
);

/* ─── keyframes ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  @keyframes blob-drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33%       { transform: translate(24px,-16px) scale(1.05); }
    66%       { transform: translate(-16px,10px) scale(0.96); }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
    50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin-icon { animation: spin 0.75s linear infinite; will-change: transform; }
  .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
`;

const font = "'DM Sans', 'Helvetica Neue', sans-serif";

/* ─── styles ─────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#f8f8f6", position: "relative", overflow: "hidden",
    fontFamily: font, padding: "24px 16px", gap: "20px",
  },
  dotGrid: {
    position: "absolute", inset: 0, zIndex: 0,
    backgroundImage: "radial-gradient(circle, #d4d4d0 1px, transparent 1px)",
    backgroundSize: "28px 28px", opacity: 0.5, pointerEvents: "none",
  },
  blob1: {
    position: "absolute", top: "8%", left: "12%",
    width: "360px", height: "360px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
    animation: "blob-drift 9s ease-in-out infinite", willChange: "transform",
    pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "absolute", bottom: "8%", right: "8%",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)",
    animation: "blob-drift 12s ease-in-out infinite reverse", willChange: "transform",
    pointerEvents: "none", zIndex: 0,
  },

  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px 22px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerIcon: {
    width: "36px", height: "36px", borderRadius: "10px",
    background: "#f3f4f6", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#374151", flexShrink: 0,
  },
  headerTitle: { fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 2px", letterSpacing: "-0.01em" },
  headerSub:   { fontSize: "12px", color: "#9ca3af", margin: 0 },
  divider: { height: "1px", background: "#f3f4f6" },

  infoCard: {
    margin: "18px 18px 0",
    padding: "16px 18px",
    background: "#fafafa",
    border: "1px solid #f3f4f6",
    borderRadius: "14px",
  },
  avatarWrap: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  avatar: {
    width: "44px", height: "44px", borderRadius: "50%",
    background: "#111827", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "600", letterSpacing: "0.02em", flexShrink: 0,
  },
  studentName:   { fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 2px" },
  studentEnroll: { fontSize: "12px", color: "#9ca3af", margin: 0, fontFamily: "'DM Mono', monospace" },
  infoGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "12px 16px",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },

  stepRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px 24px 4px", gap: "0",
  },
  stepLine: (done) => ({
    flex: 1, height: "1.5px", marginBottom: "22px",
    background: done ? "#111827" : "#e5e7eb",
    transition: "background 0.4s ease",
  }),

  actions: {
    padding: "16px 18px 20px",
    display: "flex", flexDirection: "column",
  },

  btn: {
    width: "100%", padding: "11px 16px",
    borderRadius: "11px", border: "none",
    fontSize: "13px", fontWeight: "500",
    cursor: "pointer", fontFamily: font,
    transition: "opacity 0.15s, transform 0.1s",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  btnOutline: { background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151" },
  btnLoading: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#3b82f6" },
  btnSuccess: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" },
  btnDark:    { background: "#111827", color: "#fff", cursor: "pointer" },
  btnDisabled:{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#d1d5db", cursor: "not-allowed" },
  btnInner:   { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },

  coordChip: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 12px", background: "#f0fdf4",
    border: "1px solid #bbf7d0", borderRadius: "8px",
    overflow: "hidden",
  },
  coordText: { fontSize: "11px", fontWeight: "500", color: "#16a34a", fontFamily: "'DM Mono', monospace" },

  errorBanner: {
    display: "flex", alignItems: "center", gap: "8px",
    marginTop: "10px", padding: "10px 13px",
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "9px", fontSize: "12px", color: "#dc2626",
  },

  successOverlay: {
    position: "absolute", inset: 0, zIndex: 20,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(4px)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "10px", borderRadius: "22px",
  },
  ripple: {
    position: "absolute",
    width: "70px", height: "70px", borderRadius: "50%",
    background: "rgba(34,197,94,0.18)", willChange: "transform, opacity",
  },
  successCircle: {
    position: "relative", zIndex: 1,
    width: "72px", height: "72px", borderRadius: "50%",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 0 14px rgba(34,197,94,0.1)",
    willChange: "transform",
  },
  successLabel: { position: "relative", zIndex: 1, fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0" },
  successSub:   { position: "relative", zIndex: 1, fontSize: "12px", color: "#9ca3af", margin: 0 },

  bottomLabel: {
    position: "relative", zIndex: 1,
    fontSize: "11px", color: "#d1d5db", letterSpacing: "0.05em",
    textTransform: "uppercase", fontWeight: "500",
  },
};

export default AttendanceForm;