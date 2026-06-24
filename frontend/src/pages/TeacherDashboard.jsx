import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import AIRobo from "../components/ai/AIRobo";
import { io } from "socket.io-client";
const POLL_INTERVAL = 30000;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

function getLectureStatus(lecture) {
  const now = new Date();
  const start = new Date(lecture.startDateTime);
  const end = new Date(lecture.endDateTime);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
}

function isToday(dt) {
  const d = new Date(dt), t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function fmt(dt, type) {
  return new Date(dt).toLocaleString("en-IN", type === "time"
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_MAP = {
  live:     { label: "Live",     color: "#0b6e31", bg: "#e3fcec", border: "#abf5d1" },
  upcoming: { label: "Upcoming", color: "#0747a6", bg: "#deebff", border: "#b3d4ff" },
  ended:    { label: "Ended",    color: "#5e6c84", bg: "#f4f5f7", border: "#dfe1e6" },
};

function Icon({ d, size = 15, strokeWidth = 1.8, color = "currentColor", fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const ICONS = {
  lectures:    ["M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z", "M8 10h8M8 14h5"],
  today:       ["M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"],
  live:        ["M12 2a10 10 0 100 20A10 10 0 0012 2z", "M12 8v4l3 3"],
  upcoming:    ["M12 20h9", "M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"],
  subjects:    ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5M2 12l10 5 10-5"],
  search:      ["M21 21l-4.35-4.35", "M17 11A6 6 0 1111 5a6 6 0 016 6z"],
  plus:        ["M12 5v14M5 12h14"],
  download:    ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  qr:          ["M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3z", "M16 16h2M16 19h2M19 16v2M21 19v2"],
  refresh:     ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  mail:        ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  building:    ["M3 21h18", "M5 21V7l8-4v18", "M19 21V11l-6-4", "M9 9v.01M9 12v.01M9 15v.01M9 18v.01"],
  id:          ["M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z", "M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"],
  alert:       ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4M12 17h.01"],
  close:       ["M18 6L6 18M6 6l12 12"],
  spin:        "M21 12a9 9 0 11-18 0",
  chevron:     ["M6 9l6 6 6-6"],
  menu:        ["M3 12h18M3 6h18M3 18h18"],
  user:        ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  check:       ["M20 6L9 17l-5-5"],
  xmark:       ["M18 6L6 18M6 6l12 12"],
};

function Spinner({ size = 18, color = "#0052cc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ animation: "tdSpin .75s linear infinite" }}>
      <path d={ICONS.spin} />
    </svg>
  );
}

function StatCard({ icon, label, value, accent, accentLight, live: isLive, delay }) {
  return (
    <motion.div {...fade(delay)} className="stat-card">
      {isLive && value > 0 && (
        <span className="live-dot" />
      )}
      <div className="stat-icon" style={{ background: accentLight, color: accent }}>
        <Icon d={icon} size={14} color={accent} />
      </div>
      <div className="stat-body">
        <motion.div
          key={value}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="stat-value"
        >
          {value}
        </motion.div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status === "live" && <span className="badge-dot" style={{ background: s.color }} />}
      {s.label}
    </span>
  );
}

function LectureCard({ lecture, onQR, onDownload, index, now }) {
  const status = useMemo(() => getLectureStatus(lecture), [lecture, now]);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    await onDownload(lecture._id, lecture.subject);
    setDownloading(false);
  };

  return (
    <motion.div
      layout
      {...fade(0.04 + index * 0.03)}
      className={`lecture-card ${status === "live" ? "lecture-card--live" : ""}`}
    >
      <div className="lc-header">
        <div className="lc-meta">
          <div className="lc-subject">{lecture.subject}</div>
          <div className="lc-time">
            <Icon d={ICONS.today} size={11} color="#7a869a" />
            <span>{fmt(lecture.startDateTime, "date")}</span>
            <span className="dot-sep" />
            <span>{fmt(lecture.startDateTime, "time")} – {fmt(lecture.endDateTime, "time")}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {lecture.attendanceCount !== undefined && (
        <div className="lc-attendance">
          <span className="lc-att-label">Present</span>
          <span className="lc-att-value">{lecture.attendanceCount}</span>
        </div>
      )}

      <div className="lc-actions">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onQR(lecture)}
          className="btn btn-primary"
        >
          <Icon d={ICONS.qr} size={13} color="#fff" />
          QR Code
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-secondary"
        >
          {downloading ? <Spinner size={13} /> : <Icon d={ICONS.download} size={13} color="#0052cc" />}
          {downloading ? "Exporting…" : "Export"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon d={ICONS.lectures} size={20} color="#7a869a" />
      </div>
      <div className="empty-title">
        {filtered ? "No lectures match your filter" : "No lectures yet"}
      </div>
      <div className="empty-sub">
        {filtered ? "Try adjusting your search or filter criteria." : "Create your first lecture to get started."}
      </div>
    </div>
  );
}

function LastUpdated({ time }) {
  if (!time) return null;
  return (
    <span className="last-updated">
      <Icon d={ICONS.refresh} size={11} color="#7a869a" />
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────
  const [lectures, setLectures] = useState([]);
  const [attendanceRequests, setAttendanceRequests] = useState([]); // FIX 1: was missing
  const [activeLecture, setActiveLecture] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveRequest, setLiveRequest] = useState(null);

  const pollingRef = useRef(null);
  const socketRef = useRef(null);

  // ── Data fetching ───────────────────────────────────────────────────────
  const fetchLectures = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await api.get("/lectures/mine");
      setLectures(Array.isArray(res.data.lectures) ? res.data.lectures : []);
      setLastUpdated(new Date());
      setFetchError("");
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load lectures");
    } finally {
      if (!silent) setRefreshing(false);
      setFetching(false);
    }
  }, []);

  const fetchAttendanceRequests = useCallback(async () => {
    try {
      const res = await api.get("/attendance/requests");
      setAttendanceRequests(res.data?.requests || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "teacher") {
      navigate("/student-dashboard", { replace: true });
      return;
    }

    fetchLectures();
    fetchAttendanceRequests();

    pollingRef.current = setInterval(() => {
      fetchLectures(true);
      fetchAttendanceRequests();
    }, POLL_INTERVAL);

    return () => clearInterval(pollingRef.current);
  }, [user, loading, navigate, fetchLectures, fetchAttendanceRequests]); // FIX 4: full dep array

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(tick);
  }, []);

useEffect(() => {
  socketRef.current = io(
    import.meta.env.VITE_API_BASE.replace("/api", "")
  );

  socketRef.current.on(
    "attendanceRequest",
    (data) => {
      setLiveRequest(data);
      fetchAttendanceRequests();
    }
  );

  return () => {
    socketRef.current?.disconnect();
  };
}, [fetchAttendanceRequests]);
  // ── Handlers ────────────────────────────────────────────────────────────
  const handleLectureCreated = async (data) => {
    try {
      const res = await api.post("/lectures", data);
      if (res.data.lecture) setLectures(p => [res.data.lecture, ...p]);
      setShowCreate(false);
      setLastUpdated(new Date());
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create lecture");
      return false;
    }
  };

  const handleExcelDownload = async (id, subject) => {
    try {
      const res = await api.get(`/lectures/${id}/excel`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${(subject || "attendance").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xlsx`,
      });
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export attendance sheet.");
    }
  };

  const approveRequest = async (id) => {
    try {
      await api.put(`/attendance/approve/${id}`);
      fetchAttendanceRequests();
      fetchLectures();
      alert("Attendance approved");
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  // FIX 2: rejectRequest was missing
  const rejectRequest = async (id) => {
    try {
      await api.put(`/attendance/reject/${id}`);
      fetchAttendanceRequests();
      alert("Request rejected");
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: lectures.length,
    today: lectures.filter(l => isToday(l.startDateTime)).length,
    live: lectures.filter(l => getLectureStatus(l) === "live").length,
    upcoming: lectures.filter(l => getLectureStatus(l) === "upcoming").length,
    subjects: [...new Set(lectures.map(l => l.subject))].length,
    ended: lectures.filter(l => getLectureStatus(l) === "ended").length,
    thisWeek: lectures.filter(l => {
      const d = new Date(l.startDateTime), n = new Date();
      const s = new Date(n); s.setDate(n.getDate() - n.getDay());
      return d >= s;
    }).length,
  }), [lectures, now]);

  const filtered = useMemo(() => {
    let list = [...lectures];
    if (filter !== "all") list = list.filter(l => getLectureStatus(l) === filter);
    if (search.trim()) list = list.filter(l => l.subject?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [lectures, filter, search, now]);

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "—";
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  // ── Loading screen ────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 14, fontFamily: "'Inter', sans-serif" }}>
          <Spinner size={28} />
          <span style={{ color: "#7a869a", fontSize: ".85rem" }}>Loading dashboard…</span>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .td {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f4f5f7;
          min-height: 100vh;
          padding: 0;
          color: #172b4d;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Top bar ── */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          border-bottom: 1px solid #dfe1e6;
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
        }
        .topbar-brand {
          font-size: .9rem;
          font-weight: 700;
          color: #172b4d;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topbar-brand span { color: #0052cc; }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0052cc, #0065ff);
          color: #fff;
          font-weight: 700;
          font-size: .72rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: .02em;
        }

        /* ── Page body ── */
        .td-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 16px 48px;
        }
        @media (min-width: 640px)  { .td-page { padding: 24px 24px 48px; } }
        @media (min-width: 1024px) { .td-page { padding: 28px 32px 48px; } }

        /* ── Page header ── */
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .page-eyebrow {
          font-size: .72rem;
          font-weight: 600;
          color: #0052cc;
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #e3fcec;
          color: #0b6e31;
          border-radius: 4px;
          padding: 1px 7px;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .06em;
        }
        .live-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #0b6e31;
          animation: tdPulse 1.6s ease-in-out infinite;
        }
        .page-title {
          font-size: clamp(1.2rem, 3vw, 1.6rem);
          font-weight: 700;
          color: #172b4d;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .page-sub {
          font-size: .8rem;
          color: #5e6c84;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .last-updated {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: .7rem;
          color: #97a0af;
          font-weight: 500;
        }
        .page-header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 14px;
          height: 36px;
          border-radius: 3px;
          font-size: .82rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: background .15s, box-shadow .15s, opacity .15s;
          white-space: nowrap;
        }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-primary { background: #0052cc; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #0065ff; }
        .btn-secondary { background: #fff; color: #0052cc; border: 1px solid #dfe1e6; }
        .btn-secondary:hover:not(:disabled) { background: #f4f5f7; }
        .btn-subtle { background: transparent; color: #5e6c84; border: 1px solid #dfe1e6; }
        .btn-subtle:hover:not(:disabled) { background: #f4f5f7; }
        .btn-danger-subtle { background: #fff0f0; color: #c0392b; border: 1px solid #ffbdad; }
        .btn-danger-subtle:hover:not(:disabled) { background: #ffe0e0; }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 480px)  { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px)  { .stats-grid { grid-template-columns: repeat(5, 1fr); } }

        .stat-card {
          background: #fff;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-body { min-width: 0; }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #172b4d;
          line-height: 1;
        }
        .stat-label {
          font-size: .68rem;
          font-weight: 600;
          color: #7a869a;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin-top: 3px;
          white-space: nowrap;
        }
        .live-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #36b37e;
          box-shadow: 0 0 0 3px rgba(54,179,126,.2);
          animation: tdPulse 2s ease-in-out infinite;
        }

        /* ── Error banner ── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff0f0;
          border: 1px solid #ffbdad;
          border-radius: 4px;
          padding: 10px 14px;
          color: #bf2600;
          font-size: .82rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        /* ── Body layout ── */
        .td-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .td-body {
            display: grid;
            grid-template-columns: 288px 1fr;
            gap: 20px;
            align-items: flex-start;
          }
        }

        /* ── Sidebar ── */
        .sidebar { display: flex; flex-direction: column; gap: 12px; }

        /* ── Panels ── */
        .panel {
          background: #fff;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          overflow: hidden;
        }
        .panel-header {
          padding: 14px 16px 0;
          font-size: .72rem;
          font-weight: 700;
          color: #7a869a;
          text-transform: uppercase;
          letter-spacing: .09em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .panel-header::before {
          content: '';
          width: 3px;
          height: 12px;
          background: #0052cc;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .panel-body { padding: 0 16px 16px; }

        /* ── Profile ── */
        .profile-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .profile-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0052cc, #0065ff);
          color: #fff;
          font-weight: 800;
          font-size: .88rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-name {
          font-weight: 700;
          color: #172b4d;
          font-size: .9rem;
          margin-bottom: 2px;
        }
        .profile-role {
          font-size: .7rem;
          color: #0052cc;
          font-weight: 600;
          background: #deebff;
          border-radius: 3px;
          padding: 1px 7px;
          display: inline-block;
        }
        .profile-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 1px solid #f4f5f7;
        }
        .profile-row:last-child { border-bottom: none; }
        .profile-row-icon { color: #97a0af; flex-shrink: 0; }
        .profile-row-label {
          font-size: .72rem;
          color: #97a0af;
          font-weight: 500;
          width: 80px;
          flex-shrink: 0;
        }
        .profile-row-value {
          font-size: .78rem;
          color: #172b4d;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }

        /* ── Snapshot ── */
        .snapshot-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #f4f5f7;
        }
        .snapshot-row:last-child { border-bottom: none; }
        .snapshot-label { font-size: .8rem; color: #5e6c84; font-weight: 500; }
        .snapshot-value { font-size: .9rem; font-weight: 800; color: #0052cc; }

        /* ── Attendance Requests ── */
        .req-card {
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          padding: 10px 12px;
          margin-bottom: 8px;
          background: #fafbfc;
        }
        .req-card:last-child { margin-bottom: 0; }
        .req-name {
          font-size: .82rem;
          font-weight: 700;
          color: #172b4d;
          margin-bottom: 2px;
        }
        .req-meta {
          font-size: .72rem;
          color: #7a869a;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .req-actions {
          display: flex;
          gap: 6px;
        }
        .req-actions .btn {
          flex: 1;
          height: 30px;
          font-size: .74rem;
        }
        .req-empty {
          font-size: .8rem;
          color: #97a0af;
          text-align: center;
          padding: 8px 0 4px;
        }

        /* ── Main panel ── */
        .main-panel { flex: 1; min-width: 0; }

        /* ── Toolbar ── */
        .toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-bottom: 1px solid #f4f5f7;
        }
        .toolbar-title {
          font-size: .72rem;
          font-weight: 700;
          color: #7a869a;
          text-transform: uppercase;
          letter-spacing: .09em;
          margin-right: 4px;
          white-space: nowrap;
        }
        .toolbar-spacer { flex: 1; }
        .search-box {
          position: relative;
          flex: 1;
          min-width: 140px;
          max-width: 220px;
        }
        @media (max-width: 480px) { .search-box { max-width: 100%; flex-basis: 100%; order: 10; } }
        .search-icon {
          position: absolute;
          left: 9px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          height: 32px;
          padding: 0 10px 0 30px;
          border: 1px solid #dfe1e6;
          border-radius: 3px;
          font-size: .8rem;
          color: #172b4d;
          background: #fafbfc;
          font-family: inherit;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .search-input:focus { border-color: #4c9aff; box-shadow: 0 0 0 2px rgba(76,154,255,.25); }
        .search-input::placeholder { color: #b3bac5; }

        /* ── Filter tabs ── */
        .filter-tabs {
          display: flex;
          gap: 0;
          border: 1px solid #dfe1e6;
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .ftab {
          padding: 0 10px;
          height: 32px;
          font-size: .76rem;
          font-weight: 600;
          cursor: pointer;
          background: #fafbfc;
          color: #5e6c84;
          border: none;
          border-right: 1px solid #dfe1e6;
          font-family: inherit;
          transition: background .12s, color .12s;
          white-space: nowrap;
        }
        .ftab:last-child { border-right: none; }
        .ftab.on { background: #deebff; color: #0052cc; }
        .ftab:hover:not(.on) { background: #f4f5f7; color: #172b4d; }

        /* ── Lecture grid ── */
        .lecture-list {
          padding: 14px 16px 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 600px) { .lecture-list { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px) and (max-width: 1023px) { .lecture-list { grid-template-columns: 1fr 1fr 1fr; } }
        @media (min-width: 1200px) { .lecture-list { grid-template-columns: 1fr 1fr; } }

        /* ── Lecture card ── */
        .lecture-card {
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          background: #fff;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: box-shadow .15s, border-color .15s;
        }
        .lecture-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); border-color: #c1c7d0; }
        .lecture-card--live { border-top: 2px solid #0052cc; }
        .lc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .lc-meta { flex: 1; min-width: 0; }
        .lc-subject {
          font-weight: 700;
          font-size: .88rem;
          color: #172b4d;
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lc-time {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          font-size: .72rem;
          color: #7a869a;
        }
        .dot-sep {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #c1c7d0;
          display: inline-block;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: .66rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: tdPulse 1.5s ease-in-out infinite;
        }
        .lc-attendance {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f4f5f7;
          border-radius: 3px;
          padding: 7px 12px;
        }
        .lc-att-label { font-size: .75rem; color: #5e6c84; font-weight: 500; }
        .lc-att-value { font-size: .88rem; font-weight: 800; color: #0052cc; }
        .lc-actions { display: flex; gap: 8px; }
        .lc-actions .btn { flex: 1; height: 32px; font-size: .78rem; }

        /* ── Create form panel ── */
        .create-panel {
          border: 1px solid #4c9aff;
          border-radius: 4px;
          background: #fff;
          overflow: hidden;
        }

        /* ── Empty state ── */
        .empty-state {
          padding: 40px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f4f5f7;
          border: 1px solid #dfe1e6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .empty-title { font-weight: 700; color: #172b4d; font-size: .88rem; }
        .empty-sub { color: #7a869a; font-size: .78rem; max-width: 220px; }

        /* ── Collapsible sidebar on mobile ── */
        .sidebar-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fff;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
          font-size: .8rem;
          font-weight: 600;
          color: #5e6c84;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
          justify-content: space-between;
        }
        .sidebar-toggle:hover { background: #f4f5f7; }
        .chevron-icon { transition: transform .2s; }
        .chevron-icon.open { transform: rotate(180deg); }
        @media (min-width: 1024px) { .sidebar-toggle { display: none; } }

        .sidebar-content {
          display: none;
          flex-direction: column;
          gap: 12px;
        }
        .sidebar-content.open { display: flex; }
        @media (min-width: 1024px) { .sidebar-content { display: flex !important; } }

        /* ── Animations ── */
        @keyframes tdSpin { to { transform: rotate(360deg); } }
        @keyframes tdPulse {
          0%, 100% { opacity: .9; transform: scale(1); }
          50%       { opacity: .4; transform: scale(1.5); }
        }
      `}</style>

      <div className="td">
        <div className="td-page">

          {/* ── Page header ── */}
          <motion.div {...fade(0)} className="page-header">
            <div className="page-header-left">
              <div className="page-eyebrow">
                {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                {stats.live > 0 && (
                  <span className="live-indicator">
                    <span className="live-indicator-dot" />
                    {stats.live} Live
                  </span>
                )}
              </div>
              <h1 className="page-title">{greeting}, {user?.name?.split(" ")[0]}</h1>
              <div className="page-sub">
                {stats.live > 0
                  ? `${stats.live} lecture${stats.live > 1 ? "s" : ""} currently live`
                  : stats.today > 0
                  ? `${stats.today} lecture${stats.today > 1 ? "s" : ""} scheduled today`
                  : "No lectures scheduled today"}
              </div>
            </div>
            <div className="page-header-actions">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fetchLectures()}
                disabled={refreshing}
                className="btn btn-subtle"
              >
                <span style={{ display: "inline-flex", animation: refreshing ? "tdSpin .75s linear infinite" : "none" }}>
                  <Icon d={ICONS.refresh} size={13} color="#5e6c84" />
                </span>
                Refresh
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(v => !v)}
                className={showCreate ? "btn btn-subtle" : "btn btn-primary"}
              >
                <Icon d={showCreate ? ICONS.close : ICONS.plus} size={13} color={showCreate ? "#5e6c84" : "#fff"} />
                {showCreate ? "Cancel" : "New Lecture"}
              </motion.button>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          <div className="stats-grid">
            <StatCard delay={0.04} icon={ICONS.lectures} label="Total"    value={stats.total}    accent="#0052cc" accentLight="#deebff" />
            <StatCard delay={0.07} icon={ICONS.today}    label="Today"    value={stats.today}    accent="#00875a" accentLight="#e3fcec" />
            <StatCard delay={0.10} icon={ICONS.live}     label="Live"     value={stats.live}     accent="#0b6e31" accentLight="#e3fcec" live />
            <StatCard delay={0.13} icon={ICONS.upcoming} label="Upcoming" value={stats.upcoming} accent="#ff8b00" accentLight="#fffae6" />
            <StatCard delay={0.16} icon={ICONS.subjects} label="Subjects" value={stats.subjects} accent="#6554c0" accentLight="#eae6ff" />
          </div>

          {fetchError && (
            <div className="error-banner">
              <Icon d={ICONS.alert} size={14} color="#bf2600" />
              {fetchError}
            </div>
          )}

          {/* ── Body ── */}
          <div className="td-body">

            {/* ── Sidebar ── */}
            <div className="sidebar">

              {/* Mobile toggle */}
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon d={ICONS.user} size={14} color="#5e6c84" />
                  Profile &amp; Summary
                </span>
                <span className={`chevron-icon ${sidebarOpen ? "open" : ""}`}>
                  <Icon d={ICONS.chevron} size={14} color="#5e6c84" />
                </span>
              </button>

              {/* FIX 3: all sidebar panels are now correctly inside sidebar-content */}
        <div className={`sidebar-content ${sidebarOpen ? "open" : ""}`}>

  {liveRequest && (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff7ed",
        border: "1px solid #f59e0b",
        color: "#92400e",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "12px",
        fontWeight: "600"
      }}
    >
      🔔 {liveRequest.studentName} requested attendance approval

      <div
        style={{
          fontSize: ".8rem",
          marginTop: "4px"
        }}
      >
        {liveRequest.subject}
      </div>
    </motion.div>
  )}

  {/* Create lecture */}
  <AnimatePresence>
    {showCreate && (
      <motion.div
        key="create"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{ overflow: "hidden" }}
      >
        <div className="create-panel">
          <div className="panel-header">
            New Lecture
          </div>

          <div className="panel-body">
            <CreateLecture
              onCreate={handleLectureCreated}
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Faculty Profile */}
                <motion.div {...fade(0.1)} className="panel">
                  <div className="panel-header">Faculty Profile</div>
                  <div className="panel-body">
                    <div className="profile-top">
                      <div className="profile-avatar">{initials}</div>
                      <div>
                        <div className="profile-name">{user?.name}</div>
                        <span className="profile-role">Faculty</span>
                      </div>
                    </div>
                    {[
                      { icon: ICONS.mail,     label: "Email",       value: user?.email },
                      { icon: ICONS.building, label: "Department",  value: user?.department },
                      { icon: ICONS.id,       label: "Employee ID", value: user?.employeeId || user?.empId },
                    ].map((r, i) => (
                      <div key={i} className="profile-row">
                        <div className="profile-row-icon"><Icon d={r.icon} size={13} color="#97a0af" /></div>
                        <span className="profile-row-label">{r.label}</span>
                        <span className="profile-row-value">{r.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Semester Snapshot */}
                <motion.div {...fade(0.14)} className="panel">
                  <div className="panel-header">Semester Snapshot</div>
                  <div className="panel-body">
                    {[
                      { label: "Total Lectures",  value: stats.total },
                      { label: "Ended",           value: stats.ended },
                      { label: "Unique Subjects", value: stats.subjects },
                      { label: "This Week",       value: stats.thisWeek },
                    ].map((r, i) => (
                      <div key={i} className="snapshot-row">
                        <span className="snapshot-label">{r.label}</span>
                        <motion.span key={r.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="snapshot-value">
                          {r.value}
                        </motion.span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Attendance Requests — FIX 3: now inside sidebar-content */}
                <motion.div {...fade(0.18)} className="panel">
                  <div className="panel-header">Attendance Requests</div>
                  <div className="panel-body">
                    {attendanceRequests.length === 0 ? (
                      <p className="req-empty">No pending requests</p>
                    ) : (
                      attendanceRequests.map((request) => (
                        <div key={request._id} className="req-card">
                          <div className="req-name">{request.studentId?.name}</div>
                          <div className="req-meta">
                            <span>{request.studentId?.enrollment}</span>
                            <span>{request.lectureId?.subject}</span>
                          </div>
                          <div className="req-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => approveRequest(request._id)}
                            >
                              <Icon d={ICONS.check} size={12} color="#fff" />
                              Approve
                            </button>
                            <button
                              className="btn btn-danger-subtle"
                              onClick={() => rejectRequest(request._id)}
                            >
                              <Icon d={ICONS.xmark} size={12} color="#c0392b" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

              </div>{/* end sidebar-content */}
            </div>{/* end sidebar */}

            {/* ── Main panel ── */}
            <motion.div {...fade(0.12)} className="panel main-panel">
              {/* Toolbar */}
              <div className="toolbar">
                <span className="toolbar-title">Lectures</span>
                <span className="toolbar-spacer" />
                <div className="search-box">
                  <span className="search-icon"><Icon d={ICONS.search} size={13} color="#b3bac5" /></span>
                  <input
                    className="search-input"
                    placeholder="Search subject…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="filter-tabs">
                  {[
                    { key: "all",      label: `All (${lectures.length})` },
                    { key: "live",     label: `Live (${stats.live})` },
                    { key: "upcoming", label: `Upcoming (${stats.upcoming})` },
                    { key: "ended",    label: `Ended (${stats.ended})` },
                  ].map(f => (
                    <button key={f.key} className={`ftab ${filter === f.key ? "on" : ""}`} onClick={() => setFilter(f.key)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0
                ? <EmptyState filtered={filter !== "all" || search.trim() !== ""} />
                : (
                  <div className="lecture-list">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((lec, i) => (
                        <LectureCard
                          key={lec._id}
                          lecture={lec}
                          index={i}
                          now={now}
                          onQR={setActiveLecture}
                          onDownload={handleExcelDownload}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )
              }
            </motion.div>

          </div>{/* end td-body */}
        </div>{/* end td-page */}
      </div>{/* end td */}

      <AnimatePresence>
        {activeLecture && <GenerateQR lecture={activeLecture} onClose={() => setActiveLecture(null)} />}
      </AnimatePresence>

      <AIRobo />
    </DashboardLayout>
  );
}