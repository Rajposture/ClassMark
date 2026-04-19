import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import AIRobo from "../components/ai/AIRobo";
import PageSkeleton from "../components/ui/PageSkeleton";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function DonutRing({ pct, size = 100, stroke = 10, color = "#7c3aed", track = "#ede9fe" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function StatCard({ label, value, sub, icon, accent, delay }) {
  return (
    <motion.div {...fadeUp(delay)} style={{
      background: "#fff", borderRadius: 20, padding: "1.25rem 1.5rem",
      border: "1px solid #ede9fe", display: "flex", alignItems: "flex-start",
      gap: 14, boxShadow: "0 2px 20px rgba(124,58,237,0.06)",
      transition: "box-shadow .2s, transform .2s",
    }}
      whileHover={{ scale: 1.025, boxShadow: "0 8px 32px rgba(124,58,237,0.13)" }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: accent + "18", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.2rem",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: ".72rem", color: "#9ca3af", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#1e1b4b", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: ".75rem", color: accent, marginTop: 3, fontWeight: 500 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function SessionRow({ subject, time, status, code }) {
  const colors = { present: { bg: "#d1fae5", text: "#065f46" }, absent: { bg: "#fee2e2", text: "#991b1b" }, upcoming: { bg: "#ede9fe", text: "#5b21b6" } };
  const c = colors[status] || colors.upcoming;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
      borderBottom: "1px solid #f5f3ff",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 700, color: "#7c3aed", flexShrink: 0 }}>
        {subject.slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subject}</div>
        <div style={{ fontSize: ".72rem", color: "#9ca3af" }}>{time} · {code}</div>
      </div>
      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".65rem", fontWeight: 700, background: c.bg, color: c.text, textTransform: "uppercase", letterSpacing: ".05em", flexShrink: 0 }}>{status}</span>
    </div>
  );
}

function StreakFlame({ count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          width: 28, height: 28, borderRadius: 8,
          background: i < count ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#f5f3ff",
          border: i < count ? "none" : "1px solid #ede9fe",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: ".65rem", transition: "all .3s",
        }}>
          {i < count ? <span style={{ color: "#fff", fontSize: ".7rem" }}>✓</span> : null}
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [tab, setTab] = useState("today");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (user.role !== "student") { navigate("/teacher-dashboard", { replace: true }); return; }
    setStudent(user);

    const mockData = {
      overallAttendance: 78,
      totalClasses: 124,
      attended: 97,
      streak: 5,
      rank: 12,
      totalStudents: 60,
      subjects: [
        { name: "Data Structures", code: "CS301", attended: 18, total: 22, pct: 82 },
        { name: "Operating Systems", code: "CS302", attended: 15, total: 22, pct: 68 },
        { name: "Computer Networks", code: "CS303", attended: 20, total: 22, pct: 91 },
        { name: "Database Systems", code: "CS304", attended: 17, total: 20, pct: 85 },
        { name: "Software Engineering", code: "CS305", attended: 12, total: 18, pct: 67 },
      ],
      todaySessions: [
        { subject: "Data Structures", time: "9:00 AM", status: "present", code: "CS301" },
        { subject: "Operating Systems", time: "11:00 AM", status: "present", code: "CS302" },
        { subject: "Computer Networks", time: "2:00 PM", status: "upcoming", code: "CS303" },
        { subject: "Database Lab", time: "4:00 PM", status: "upcoming", code: "CS304L" },
      ],
      recentSessions: [
        { subject: "Software Engineering", time: "Yesterday 10:00 AM", status: "absent", code: "CS305" },
        { subject: "Data Structures", time: "Yesterday 9:00 AM", status: "present", code: "CS301" },
        { subject: "Database Systems", time: "Mon 3:00 PM", status: "present", code: "CS304" },
        { subject: "Computer Networks", time: "Mon 2:00 PM", status: "present", code: "CS303" },
      ],
      alerts: [
        { type: "warn", msg: "Operating Systems attendance below 75% — attend next 3 classes to recover." },
        { type: "warn", msg: "Software Engineering at 67% — at risk of detention." },
      ],
    };

    setTimeout(() => {
      setDashData(mockData);
      setFetching(false);
    }, 600);
  }, [user, loading, navigate]);

  if (loading) return <PageSkeleton />;
  if (fetching || !student || !dashData) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <motion.div animate={{ opacity: [.4, 1, .4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: "#7c3aed", fontWeight: 600, fontSize: ".95rem" }}>
            Loading your dashboard...
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const { overallAttendance, totalClasses, attended, streak, rank, totalStudents, subjects, todaySessions, recentSessions, alerts } = dashData;
  const firstName = student.name?.split(" ")[0];
  const atRisk = subjects.filter(s => s.pct < 75).length;
  const safe = subjects.filter(s => s.pct >= 75).length;

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .dash-root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8f7ff; min-height: 100vh; }
        .dash-inner { max-width: 1180px; margin: 0 auto; padding: clamp(1rem,4vw,2rem) clamp(1rem,4vw,2.5rem) 3rem; padding-top: clamp(5.5rem,8vw,6.5rem); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
        .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; }
        .card { background: #fff; border-radius: 20px; border: 1px solid #ede9fe; box-shadow: 0 2px 20px rgba(124,58,237,0.055); padding: 1.5rem; }
        .card-sm { padding: 1.1rem 1.25rem; }
        .tab-btn { padding: .38rem .9rem; border-radius: 8px; font-size: .78rem; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: inherit; }
        .tab-btn.active { background: #7c3aed; color: #fff; }
        .tab-btn.inactive { background: transparent; color: #9ca3af; }
        .tab-btn.inactive:hover { background: #f5f3ff; color: #7c3aed; }
        .subj-bar-bg { background: #f5f3ff; border-radius: 999px; height: 6px; overflow: hidden; }
        .subj-bar-fill { height: 6px; border-radius: 999px; transition: width 1s cubic-bezier(.22,1,.36,1); }
        .alert-item { display: flex; gap: 10px; padding: .75rem 1rem; border-radius: 12px; font-size: .8rem; }
        .btn-scan { display: inline-flex; align-items: center; gap: 8px; padding: .7rem 1.5rem; border-radius: 12px; background: linear-gradient(135deg,#7c3aed,#a855f7); color: #fff; font-weight: 700; font-size: .88rem; border: none; cursor: pointer; font-family: inherit; box-shadow: 0 4px 20px rgba(124,58,237,0.35); transition: transform .2s, box-shadow .2s; }
        .btn-scan:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.45); }
        .btn-scan:active { transform: scale(.97); }
        @media(max-width:900px) { .grid-4{grid-template-columns:repeat(2,1fr)} .grid-3{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:640px) { .grid-4{grid-template-columns:1fr 1fr} .grid-3{grid-template-columns:1fr} .grid-2{grid-template-columns:1fr} .dash-inner{padding-top:5rem} }
        @media(max-width:420px) { .grid-4{grid-template-columns:1fr} }
      `}</style>

      <div className="dash-root">
        <div className="dash-inner">

          <motion.div {...fadeUp(0)} style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: ".75rem", color: "#a78bfa", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".3rem" }}>{greeting} 👋</div>
                <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, color: "#1e1b4b", letterSpacing: "-.03em", lineHeight: 1.1 }}>
                  Welcome back, {firstName}
                </h1>
                <p style={{ color: "#9ca3af", marginTop: ".4rem", fontSize: ".88rem" }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <motion.button
                className="btn-scan"
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/scan")}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  <path d="M3 17h2v2H3zM7 17h2v2H7zM3 13h2v2H3zM7 13h2v2H7z"/>
                </svg>
                Scan QR
              </motion.button>
            </div>
          </motion.div>

          {alerts.length > 0 && (
            <motion.div {...fadeUp(0.05)} style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
              {alerts.map((a, i) => (
                <div key={i} className="alert-item" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                  <span style={{ color: "#92400e" }}>{a.msg}</span>
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
            <StatCard label="Overall Attendance" value={`${overallAttendance}%`} sub={overallAttendance >= 75 ? "✓ Above threshold" : "⚠ Below 75%"} icon="📅" accent={overallAttendance >= 75 ? "#059669" : "#dc2626"} delay={0.08} />
            <StatCard label="Classes Attended" value={`${attended}/${totalClasses}`} sub="This semester" icon="✅" accent="#7c3aed" delay={0.14} />
            <StatCard label="Subjects Safe" value={`${safe}/${subjects.length}`} sub={`${atRisk} at risk`} icon="📚" accent={atRisk > 0 ? "#d97706" : "#059669"} delay={0.2} />
            <StatCard label="Day Streak" value={`${streak} days`} sub="Keep it up!" icon="🔥" accent="#f59e0b" delay={0.26} />
          </div>

          <div className="grid-2" style={{ marginBottom: "1.25rem", alignItems: "start" }}>

            <motion.div {...fadeUp(0.18)} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" }}>Overall Attendance</h2>
                <span style={{ fontSize: ".72rem", color: "#7c3aed", fontWeight: 600, background: "#f5f3ff", padding: ".25rem .65rem", borderRadius: 999 }}>Semester 4</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <DonutRing pct={overallAttendance} size={110} stroke={10} color={overallAttendance >= 75 ? "#7c3aed" : "#ef4444"} track="#ede9fe" />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e1b4b", lineHeight: 1 }}>{overallAttendance}%</span>
                    <span style={{ fontSize: ".6rem", color: "#9ca3af", marginTop: 2 }}>attended</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                    <span style={{ fontSize: ".8rem", color: "#6b7280" }}>Present</span>
                    <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#1e1b4b" }}>{attended}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                    <span style={{ fontSize: ".8rem", color: "#6b7280" }}>Absent</span>
                    <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#ef4444" }}>{totalClasses - attended}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                    <span style={{ fontSize: ".8rem", color: "#6b7280" }}>Total</span>
                    <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#1e1b4b" }}>{totalClasses}</span>
                  </div>
                  <div style={{ marginTop: ".75rem", padding: ".5rem .75rem", borderRadius: 10, background: overallAttendance >= 75 ? "#d1fae5" : "#fee2e2" }}>
                    <span style={{ fontSize: ".72rem", fontWeight: 600, color: overallAttendance >= 75 ? "#065f46" : "#991b1b" }}>
                      {overallAttendance >= 75 ? `You can skip ${Math.floor((attended - 0.75 * totalClasses) / 0.75)} more classes` : `Attend next ${Math.ceil((0.75 * totalClasses - attended) / 0.25)} classes to reach 75%`}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #f5f3ff" }}>
                <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#6b7280", marginBottom: ".65rem" }}>Weekly Streak</div>
                <StreakFlame count={streak} />
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.22)} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: ".5rem", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" }}>Sessions</h2>
                  <div style={{ display: "flex", gap: ".35rem", background: "#f5f3ff", padding: ".3rem", borderRadius: 10 }}>
                    {["today", "recent"].map(t => (
                      <button key={t} className={`tab-btn ${tab === t ? "active" : "inactive"}`} onClick={() => setTab(t)}>
                        {t === "today" ? "Today" : "Recent"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 1.5rem 1.25rem" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }}>
                    {(tab === "today" ? todaySessions : recentSessions).map((s, i) => (
                      <SessionRow key={i} {...s} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <motion.div {...fadeUp(0.28)} className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: ".5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" }}>Subject-wise Attendance</h2>
              <span style={{ fontSize: ".72rem", color: "#9ca3af" }}>Min required: 75%</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
              {subjects.map((s, i) => (
                <motion.div key={s.code} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.06, duration: .45, ease: [.22, 1, .36, 1] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".62rem", fontWeight: 800, color: "#7c3aed", flexShrink: 0, letterSpacing: "-.02em" }}>
                      {s.code.replace("CS", "")}
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".35rem" }}>
                        <span style={{ fontSize: ".83rem", fontWeight: 600, color: "#1e1b4b" }}>{s.name}</span>
                        <span style={{ fontSize: ".8rem", fontWeight: 700, color: s.pct >= 75 ? "#7c3aed" : "#ef4444" }}>{s.pct}%</span>
                      </div>
                      <div className="subj-bar-bg">
                        <motion.div
                          className="subj-bar-fill"
                          style={{ background: s.pct >= 75 ? "linear-gradient(90deg,#7c3aed,#a855f7)" : "linear-gradient(90deg,#ef4444,#f97316)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: [.22, 1, .36, 1] }}
                        />
                      </div>
                      <div style={{ fontSize: ".68rem", color: "#9ca3af", marginTop: ".25rem" }}>{s.attended}/{s.total} classes · {s.code}</div>
                    </div>
                    {s.pct < 75 && (
                      <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>At Risk</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid-3" style={{ marginBottom: "1.25rem" }}>

            <motion.div {...fadeUp(0.34)} className="card" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>🎯</div>
              <h3 style={{ fontSize: ".95rem", fontWeight: 700, marginBottom: ".35rem" }}>Quick Scan</h3>
              <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.75)", marginBottom: "1rem", lineHeight: 1.55 }}>Scan the class QR to mark your attendance instantly.</p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                onClick={() => navigate("/scan")}
                style={{ padding: ".55rem 1.1rem", borderRadius: 10, background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(4px)" }}
              >
                Open Scanner →
              </motion.button>
            </motion.div>

            <motion.div {...fadeUp(0.38)} className="card">
              <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>👤</div>
              <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: "#1e1b4b", marginBottom: ".85rem" }}>Profile</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
                {[
                  ["Name", student.name],
                  ["Enrollment", student.enrollment || "N/A"],
                  ["Email", student.email || "N/A"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: ".76rem", color: "#9ca3af", flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#1e1b4b", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.42)} className="card">
              <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>🏆</div>
              <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: "#1e1b4b", marginBottom: ".85rem" }}>Standing</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: ".76rem", color: "#9ca3af" }}>Class Rank</span>
                  <span style={{ fontSize: ".88rem", fontWeight: 800, color: "#7c3aed" }}>#{rank} / {totalStudents}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: ".76rem", color: "#9ca3af" }}>Safe Subjects</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#059669" }}>{safe} / {subjects.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: ".76rem", color: "#9ca3af" }}>At Risk</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: atRisk > 0 ? "#ef4444" : "#059669" }}>{atRisk} subjects</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: ".76rem", color: "#9ca3af" }}>Current Streak</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#f59e0b" }}>🔥 {streak} days</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div {...fadeUp(0.46)} style={{ textAlign: "center", color: "#c4b5fd", fontSize: ".78rem", fontWeight: 500 }}>
            Consistency is key. Keep your attendance strong 💪
          </motion.div>

        </div>
      </div>

      <AIRobo />
    </DashboardLayout>
  );
}