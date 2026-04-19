import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import AIRobo from "../components/ai/AIRobo";

const POLL_INTERVAL = 30000;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] },
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
  live:     { label: "Live",     color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  upcoming: { label: "Upcoming", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  ended:    { label: "Ended",    color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
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
  chevronDown: ["M6 9l6 6 6-6"],
  download:    ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  qr:          ["M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3z", "M16 16h2M16 19h2M19 16v2M21 19v2"],
  refresh:     ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  user:        ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  building:    ["M3 21h18", "M5 21V7l8-4v18", "M19 21V11l-6-4", "M9 9v.01M9 12v.01M9 15v.01M9 18v.01"],
  mail:        ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  id:          ["M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z", "M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"],
  alert:       ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4M12 17h.01"],
  close:       ["M18 6L6 18M6 6l12 12"],
  spin:        "M21 12a9 9 0 11-18 0",
};

function Spinner({ size = 18, color = "#6366f1" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ animation: "tdSpin .75s linear infinite" }}>
      <path d={ICONS.spin} />
    </svg>
  );
}

function StatCard({ icon, label, value, accent, delta, delay, live: isLive }) {
  return (
    <motion.div {...fade(delay)} style={{
      background: "#fff", border: "1px solid #e8e7f8",
      borderRadius: 16, padding: "1.2rem 1.3rem",
      display: "flex", flexDirection: "column", gap: 12,
      position: "relative", overflow: "hidden",
    }}>
      {isLive && value > 0 && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          width: 7, height: 7, borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 0 3px rgba(34,197,94,.2)",
          animation: "tdPulse 2s ease-in-out infinite",
        }} />
      )}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: accent + "12",
        border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
      }}>
        <Icon d={icon} size={15} color={accent} />
      </div>
      <div>
        <motion.div
          key={value}
          initial={{ scale: .85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: .35, ease: [.22, 1, .36, 1] }}
          style={{ fontSize: "1.65rem", fontWeight: 800, color: "#1e1b4b", lineHeight: 1 }}
        >
          {value}
        </motion.div>
        <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

function LectureCard({ lecture, onQR, onDownload, index, now }) {
  const status = useMemo(() => getLectureStatus(lecture), [lecture, now]);
  const s = STATUS_MAP[status];
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
      {...fade(0.04 + index * 0.035)}
      whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(99,102,241,.1)" }}
      style={{
        background: "#fff", border: "1px solid #e8e7f8", borderRadius: 18,
        padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: 14,
        transition: "box-shadow .2s", position: "relative", overflow: "hidden",
      }}
    >
      {status === "live" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5)",
          backgroundSize: "200% 100%",
          animation: "tdShimmer 2.5s linear infinite",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1e1b4b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
            {lecture.subject}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".72rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon d={ICONS.today} size={11} color="#c4b5fd" />
              {fmt(lecture.startDateTime, "date")}
            </span>
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#d1d5db" }} />
            <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>
              {fmt(lecture.startDateTime, "time")} – {fmt(lecture.endDateTime, "time")}
            </span>
          </div>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 8,
          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          fontSize: ".62rem", fontWeight: 700, letterSpacing: ".06em",
          textTransform: "uppercase", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {status === "live" && (
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, animation: "tdPulse 1.5s ease-in-out infinite" }} />
          )}
          {s.label}
        </span>
      </div>

      {lecture.attendanceCount !== undefined && (
        <div style={{
          background: "#faf9ff", border: "1px solid #ede9fe",
          borderRadius: 10, padding: "7px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: ".72rem", color: "#6b7280", fontWeight: 500 }}>Students marked present</span>
          <span style={{ fontSize: ".85rem", fontWeight: 800, color: "#4f46e5" }}>{lecture.attendanceCount}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
          onClick={() => onQR(lecture)}
          style={{
            flex: 1, padding: ".58rem .8rem", borderRadius: 10,
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color: "#fff", fontWeight: 700, fontSize: ".78rem",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(99,102,241,.28)",
            fontFamily: "inherit",
          }}
        >
          <Icon d={ICONS.qr} size={13} color="#fff" />
          QR Code
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
          onClick={handleDownload}
          disabled={downloading}
          style={{
            flex: 1, padding: ".58rem .8rem", borderRadius: 10,
            background: downloading ? "#f1f5f9" : "#faf9ff",
            color: downloading ? "#9ca3af" : "#4f46e5",
            fontWeight: 700, fontSize: ".78rem",
            border: "1px solid #ede9fe", cursor: downloading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "background .2s, color .2s",
            fontFamily: "inherit",
          }}
        >
          {downloading ? <Spinner size={13} /> : <Icon d={ICONS.download} size={13} color="#4f46e5" />}
          {downloading ? "Exporting…" : "Export"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div style={{ padding: "3rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f1f0ff", border: "1px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#c4b5fd" }}>
        <Icon d={ICONS.lectures} size={20} color="#c4b5fd" />
      </div>
      <div style={{ fontWeight: 700, color: "#374151", fontSize: ".92rem" }}>
        {filtered ? "No lectures match your filter" : "No lectures yet"}
      </div>
      <div style={{ color: "#9ca3af", fontSize: ".78rem", maxWidth: 220 }}>
        {filtered ? "Try adjusting your search or filter criteria." : "Create your first lecture to get started."}
      </div>
    </div>
  );
}

function LastUpdated({ time }) {
  if (!time) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: ".68rem", fontWeight: 500 }}>
      <Icon d={ICONS.refresh} size={11} color="#9ca3af" />
      Updated {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const pollingRef = useRef(null);

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

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (user.role !== "teacher") { navigate("/student-dashboard", { replace: true }); return; }

    fetchLectures();

    pollingRef.current = setInterval(() => fetchLectures(true), POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [user, loading, navigate, fetchLectures]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(tick);
  }, []);

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
      const a = Object.assign(document.createElement("a"), { href: url, download: `${(subject || "attendance").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xlsx` });
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert("Failed to export attendance sheet."); }
  };

  const stats = useMemo(() => ({
    total: lectures.length,
    today: lectures.filter(l => isToday(l.startDateTime)).length,
    live: lectures.filter(l => getLectureStatus(l) === "live").length,
    upcoming: lectures.filter(l => getLectureStatus(l) === "upcoming").length,
    subjects: [...new Set(lectures.map(l => l.subject))].length,
    ended: lectures.filter(l => getLectureStatus(l) === "ended").length,
  }), [lectures, now]);

  const filtered = useMemo(() => {
    let list = [...lectures];
    if (filter !== "all") list = list.filter(l => getLectureStatus(l) === filter);
    if (search.trim()) list = list.filter(l => l.subject?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [lectures, filter, search, now]);

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "—";

  if (fetching) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Spinner size={32} />
          <span style={{ color: "#9ca3af", fontSize: ".85rem", fontWeight: 500 }}>Loading your dashboard</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .td { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f3fc; min-height:100vh; padding:78px 0 4rem; }
        .td-in { max-width:1240px; margin:0 auto; padding:0 clamp(1rem,4vw,2.5rem); }
        .td-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:22px; }
        .td-body { display:grid; grid-template-columns:320px 1fr; gap:20px; align-items:flex-start; }
        .card { background:#fff; border:1px solid #e8e7f8; border-radius:20px; padding:1.4rem 1.5rem; }
        .card-label { font-size:.68rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.1em; margin-bottom:1.1rem; display:flex; align-items:center; gap:7px; }
        .card-label::before { content:''; width:3px; height:13px; background:linear-gradient(to bottom,#6366f1,#a855f7); border-radius:2px; flex-shrink:0; }
        .filter-row { display:flex; gap:3px; background:#f4f3fc; border-radius:10px; padding:3px; }
        .ftab { padding:5px 12px; border-radius:8px; font-size:.72rem; font-weight:600; border:none; cursor:pointer; background:transparent; color:#94a3b8; font-family:inherit; transition:background .15s,color .15s,box-shadow .15s; }
        .ftab.on { background:#fff; color:#4f46e5; box-shadow:0 1px 4px rgba(99,102,241,.15); }
        .search-box { position:relative; }
        .search-box svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); pointer-events:none; }
        .search-in { width:100%; padding:.48rem .75rem .48rem 2rem; border-radius:10px; border:1px solid #e8e7f8; background:#faf9ff; font-size:.8rem; color:#374151; font-family:inherit; outline:none; transition:border-color .2s,box-shadow .2s; }
        .search-in:focus { border-color:#a5b4fc; box-shadow:0 0 0 3px rgba(165,180,252,.15); }
        .search-in::placeholder { color:#c4b5fd; }
        .lec-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .err { display:flex; align-items:center; gap:8px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:.7rem 1rem; color:#dc2626; font-size:.8rem; font-weight:500; margin-bottom:18px; }
        .divider { height:1px; background:#f4f3fc; margin:.8rem 0; }
        @keyframes tdSpin { to { transform:rotate(360deg); } }
        @keyframes tdPulse { 0%,100% { opacity:.8; transform:scale(1); } 50% { opacity:.3; transform:scale(1.6); } }
        @keyframes tdShimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @media(max-width:1060px) { .td-body { grid-template-columns:1fr; } .lec-grid { grid-template-columns:1fr; } }
        @media(max-width:860px)  { .td-stats { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:560px)  { .td-stats { grid-template-columns:1fr 1fr; } }
        @media(max-width:380px)  { .td-stats { grid-template-columns:1fr; } }
      `}</style>

      <div className="td">
        <div className="td-in">

          <motion.div {...fade(0)} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: "1.6rem" }}>
            <div>
              <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#6366f1", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".1em", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 800, color: "#1e1b4b", margin: 0, lineHeight: 1.1 }}>
                {now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"}, {user?.name?.split(" ")[0]}
              </h1>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: ".8rem", color: "#6b7280", fontWeight: 500 }}>
                  {stats.live > 0
                    ? `${stats.live} lecture${stats.live > 1 ? "s" : ""} currently live`
                    : stats.today > 0
                    ? `${stats.today} lecture${stats.today > 1 ? "s" : ""} scheduled today`
                    : "No lectures scheduled today"}
                </span>
                <LastUpdated time={lastUpdated} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                onClick={() => fetchLectures()}
                disabled={refreshing}
                style={{ padding: ".5rem .9rem", borderRadius: 10, border: "1px solid #e8e7f8", background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: ".78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
              >
                <span style={{ display: "inline-flex", animation: refreshing ? "tdSpin .75s linear infinite" : "none" }}>
                  <Icon d={ICONS.refresh} size={13} color="#9ca3af" />
                </span>
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                onClick={() => setShowCreate(v => !v)}
                style={{ padding: ".5rem 1.1rem", borderRadius: 10, background: showCreate ? "#f4f3fc" : "linear-gradient(135deg,#4f46e5,#7c3aed)", color: showCreate ? "#4f46e5" : "#fff", fontWeight: 700, fontSize: ".8rem", border: showCreate ? "1px solid #ede9fe" : "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: showCreate ? "none" : "0 4px 14px rgba(99,102,241,.3)", fontFamily: "inherit", transition: "all .2s" }}
              >
                <Icon d={showCreate ? ICONS.close : ICONS.plus} size={13} color={showCreate ? "#4f46e5" : "#fff"} />
                {showCreate ? "Cancel" : "New Lecture"}
              </motion.button>
            </div>
          </motion.div>

          <div className="td-stats">
            <StatCard delay={0.04} icon={ICONS.lectures}  label="Total Lectures" value={stats.total}    accent="#6366f1" />
            <StatCard delay={0.08} icon={ICONS.today}     label="Today"          value={stats.today}    accent="#0891b2" />
            <StatCard delay={0.12} icon={ICONS.live}      label="Live Now"       value={stats.live}     accent="#16a34a" live />
            <StatCard delay={0.16} icon={ICONS.upcoming}  label="Upcoming"       value={stats.upcoming} accent="#d97706" />
            <StatCard delay={0.20} icon={ICONS.subjects}  label="Subjects"       value={stats.subjects} accent="#7c3aed" />
          </div>

          {fetchError && (
            <div className="err">
              <Icon d={ICONS.alert} size={14} color="#dc2626" />
              {fetchError}
            </div>
          )}

          <div className="td-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <AnimatePresence>
                {showCreate && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: .35, ease: [.22, 1, .36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="card" style={{ borderColor: "#c7d2fe" }}>
                      <div className="card-label" style={{ marginBottom: "1.2rem" }}>New Lecture</div>
                      <CreateLecture onCreate={handleLectureCreated} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div {...fade(0.1)} className="card">
                <div className="card-label">Faculty Profile</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.1rem" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".9rem", color: "#fff", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: ".92rem" }}>{user?.name}</div>
                    <div style={{ fontSize: ".7rem", color: "#6366f1", fontWeight: 600, marginTop: 2 }}>Faculty</div>
                  </div>
                </div>

                {[
                  { icon: ICONS.mail, label: "Email", value: user?.email },
                  { icon: ICONS.building, label: "Department", value: user?.department },
                  { icon: ICONS.id, label: "Employee ID", value: user?.employeeId || user?.empId },
                ].map((r, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f3fc" : "none" }}>
                    <div style={{ color: "#c4b5fd", flexShrink: 0 }}><Icon d={r.icon} size={13} color="#c4b5fd" /></div>
                    <span style={{ fontSize: ".73rem", color: "#9ca3af", fontWeight: 500, width: 82, flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontSize: ".78rem", color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value || "—"}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div {...fade(0.15)} className="card">
                <div className="card-label">Semester Snapshot</div>
                {[
                  { label: "Total Lectures", value: stats.total },
                  { label: "Ended",          value: stats.ended },
                  { label: "Unique Subjects", value: stats.subjects },
                  { label: "This Week",      value: lectures.filter(l => { const d = new Date(l.startDateTime); const n = new Date(); const s = new Date(n); s.setDate(n.getDate() - n.getDay()); return d >= s; }).length },
                ].map((r, i, arr) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f3fc" : "none" }}>
                    <span style={{ fontSize: ".78rem", color: "#6b7280", fontWeight: 500 }}>{r.label}</span>
                    <motion.span key={r.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: ".92rem", fontWeight: 800, color: "#4f46e5" }}>{r.value}</motion.span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div {...fade(0.14)} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: "1.1rem" }}>
                <div className="card-label" style={{ margin: 0 }}>Lectures</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="search-box" style={{ minWidth: 180 }}>
                    <Icon d={ICONS.search} size={13} color="#c4b5fd" />
                    <input className="search-in" placeholder="Search by subject…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div className="filter-row">
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
              </div>

              {filtered.length === 0
                ? <EmptyState filtered={filter !== "all" || search.trim() !== ""} />
                : (
                  <div className="lec-grid">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((lec, i) => (
                        <LectureCard key={lec._id} lecture={lec} index={i} now={now} onQR={setActiveLecture} onDownload={handleExcelDownload} />
                      ))}
                    </AnimatePresence>
                  </div>
                )
              }
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeLecture && <GenerateQR lecture={activeLecture} onClose={() => setActiveLecture(null)} />}
      </AnimatePresence>

      <AIRobo />
    </DashboardLayout>
  );
}