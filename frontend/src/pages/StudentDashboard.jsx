import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import AIRobo from "../components/ai/AIRobo";
import PageSkeleton from "../components/ui/PageSkeleton";

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  QrCode: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      <path d="M3 17h2v2H3zM7 17h2v2H7zM3 13h2v2H3zM7 13h2v2H7z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Notes: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  BookCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <polyline points="9 11 11 13 15 9"/>
    </svg>
  ),
};

// ─── DonutRing ────────────────────────────────────────────────────────────────
function DonutRing({ pct, size = 80, stroke = 8, color = "#4F46E5", track = "#E0E7FF" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ─── ToDoList ─────────────────────────────────────────────────────────────────
function ToDoList() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sd_todos") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");

  const save = (next) => {
    setItems(next);
    try { localStorage.setItem("sd_todos", JSON.stringify(next)); } catch {}
  };
  const add = () => {
    const text = input.trim();
    if (!text) return;
    save([{ id: Date.now(), text, done: false, priority }, ...items]);
    setInput("");
  };
  const toggle = (id) => save(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => save(items.filter(i => i.id !== id));

  const pc = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };
  const sorted = [...items].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return (a.done ? 10 : 0) - (b.done ? 10 : 0) || o[a.priority] - o[b.priority];
  });
  const done = items.filter(i => i.done).length;
  const pct = items.length ? (done / items.length) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", gap: "0.75rem" }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>To-Do List</div>
          <div style={{ fontSize: "0.68rem", color: "#94A3B8", marginTop: 2 }}>{done}/{items.length} completed</div>
        </div>
        {items.length > 0 && (
          <div style={{ flex: 1, maxWidth: 100, height: 4, background: "#EEF2FF", borderRadius: 999, overflow: "hidden" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
              style={{ height: "100%", background: "linear-gradient(90deg,#4F46E5,#818CF8)", borderRadius: 999 }} />
          </div>
        )}
      </div>

      {/* Add row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem" }}>
        <input
          style={{
            flex: 1, minWidth: 0, padding: "0.5rem 0.7rem", borderRadius: 9,
            border: "1.5px solid #E8E4FF", fontSize: "0.78rem", fontFamily: "inherit",
            color: "#0F172A", outline: "none", background: "#FAFAFE",
          }}
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
        />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {["high", "medium", "low"].map(p => (
            <button key={p} onClick={() => setPriority(p)} title={p}
              style={{
                width: 13, height: 13, borderRadius: "50%", cursor: "pointer",
                background: priority === p ? pc[p] : pc[p] + "30",
                border: `2px solid ${priority === p ? pc[p] : "transparent"}`,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <button onClick={add}
          style={{
            width: 30, height: 30, borderRadius: 9, background: "#4F46E5", color: "#fff",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
          <Icon.Plus />
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", maxHeight: 200, overflowY: "auto" }}>
        <AnimatePresence initial={false}>
          {sorted.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: "0.76rem", color: "#C4B5FD", textAlign: "center", padding: "1rem 0" }}>
              No tasks yet. Add one to get started.
            </motion.div>
          )}
          {sorted.map(item => (
            <motion.div key={item.id} layout
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "0.45rem 0", borderBottom: "1px solid #F5F3FF",
                overflow: "hidden",
              }}
            >
              <button onClick={() => toggle(item.id)}
                style={{
                  width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${pc[item.priority]}`, background: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {item.done && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={pc[item.priority]} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span style={{
                flex: 1, minWidth: 0, fontSize: "0.78rem", color: "#0F172A",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                textDecoration: item.done ? "line-through" : "none",
                opacity: item.done ? 0.45 : 1,
              }}>{item.text}</span>
              <span style={{
                fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
                padding: "2px 5px", borderRadius: 999, flexShrink: 0,
                background: pc[item.priority] + "20", color: pc[item.priority],
              }}>{item.priority}</span>
              <button onClick={() => remove(item.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#C4B5FD", display: "flex", alignItems: "center", padding: 2, borderRadius: 4, flexShrink: 0 }}>
                <Icon.Trash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── QuickNotes ───────────────────────────────────────────────────────────────
function QuickNotes() {
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem("sd_notes") || ""; } catch { return ""; }
  });
  const [saved, setSaved] = useState(true);

  const handleChange = (e) => { setNotes(e.target.value); setSaved(false); };
  const handleSave = () => {
    try { localStorage.setItem("sd_notes", notes); } catch {}
    setSaved(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon.Notes />
          </div>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>Quick Notes</span>
        </div>
        <button onClick={handleSave}
          style={{
            padding: "0.25rem 0.7rem", borderRadius: 7, border: "none",
            background: saved ? "#F0EFFE" : "#4F46E5",
            color: saved ? "#94A3B8" : "#fff",
            fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
          }}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <textarea
        placeholder="Jot down formulas, reminders, or anything you need…"
        value={notes}
        onChange={handleChange}
        onBlur={handleSave}
        style={{
          flex: 1, width: "100%", minHeight: 110, resize: "vertical",
          border: "1.5px solid #E8E4FF", borderRadius: 10,
          padding: "0.65rem 0.8rem", fontSize: "0.78rem", fontFamily: "inherit",
          color: "#0F172A", background: "#FAFAFE", outline: "none",
          lineHeight: 1.6, boxSizing: "border-box", transition: "border-color .2s",
        }}
        onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.background = "#fff"; }}
        onBlurCapture={e => { e.target.style.borderColor = "#E8E4FF"; e.target.style.background = "#FAFAFE"; }}
      />
    </div>
  );
}

// ─── StudyGoal ────────────────────────────────────────────────────────────────
function StudyGoal() {
  const [goal, setGoal] = useState(() => {
    try { return parseInt(localStorage.getItem("sd_goal") || "6"); } catch { return 6; }
  });
  const [done, setDone] = useState(() => {
    try { return parseInt(localStorage.getItem("sd_goal_done") || "0"); } catch { return 0; }
  });

  const setHours = (h) => { setGoal(h); try { localStorage.setItem("sd_goal", h); } catch {} };
  const logHour = () => {
    if (done >= goal) return;
    const next = done + 1;
    setDone(next);
    try { localStorage.setItem("sd_goal_done", next); } catch {}
  };
  const reset = () => { setDone(0); try { localStorage.setItem("sd_goal_done", 0); } catch {} };

  const pct = Math.min((done / goal) * 100, 100);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon.Target />
        </div>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>Daily Study Goal</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "0.75rem" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <DonutRing pct={pct} size={76} stroke={7} color={pct >= 100 ? "#10B981" : "#F59E0B"} track="#FEF3C7" />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{done}h</span>
            <span style={{ fontSize: "0.5rem", color: "#94A3B8" }}>of {goal}h</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.72rem", color: "#64748B", marginBottom: "0.4rem" }}>Daily target</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[2, 4, 6, 8].map(h => (
              <button key={h} onClick={() => setHours(h)}
                style={{
                  padding: "0.22rem 0.55rem", borderRadius: 6,
                  background: goal === h ? "#4F46E5" : "#F0EFFE",
                  color: goal === h ? "#fff" : "#4F46E5",
                  border: "none", fontSize: "0.7rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                }}>{h}h</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={logHour} disabled={done >= goal}
          style={{
            flex: 1, padding: "0.42rem 0.75rem", borderRadius: 9,
            background: done >= goal ? "#F0EFFE" : "#4F46E5",
            color: done >= goal ? "#C4B5FD" : "#fff",
            border: "none", fontSize: "0.75rem", fontWeight: 600,
            cursor: done >= goal ? "default" : "pointer", fontFamily: "inherit", transition: "all .2s",
          }}>
          {done >= goal ? "Goal reached ✓" : "+ Log 1 hour"}
        </button>
        <button onClick={reset}
          style={{
            padding: "0.42rem 0.75rem", borderRadius: 9,
            background: "#F0EFFE", color: "#94A3B8",
            border: "none", fontSize: "0.7rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>Reset</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent]   = useState(null);
  const [fetching, setFetching] = useState(true);
  const [dashData, setDashData] = useState(null);
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
        { name: "Data Structures",      code: "CS301", attended: 18, total: 22, pct: 82 },
        { name: "Operating Systems",    code: "CS302", attended: 15, total: 22, pct: 68 },
        { name: "Computer Networks",    code: "CS303", attended: 20, total: 22, pct: 91 },
        { name: "Database Systems",     code: "CS304", attended: 17, total: 20, pct: 85 },
        { name: "Software Engineering", code: "CS305", attended: 12, total: 18, pct: 67 },
      ],
    };
    setTimeout(() => { setDashData(mockData); setFetching(false); }, 600);
  }, [user, loading, navigate]);

  if (loading) return <PageSkeleton />;
  if (fetching || !student || !dashData) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ color: "#4F46E5", fontWeight: 600, fontSize: "0.9rem" }}>
            Loading dashboard…
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const { overallAttendance, totalClasses, attended, streak, rank, totalStudents, subjects } = dashData;
  const firstName = student.name?.split(" ")[0] || "Student";
  const atRisk  = subjects.filter(s => s.pct < 75).length;
  const safe    = subjects.filter(s => s.pct >= 75).length;
  const canSkip = Math.max(0, Math.floor((attended - 0.75 * totalClasses) / 0.75));

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .sd-root {
          font-family: 'Inter', sans-serif;
          background: #F5F3FF;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }

        .sd-inner {
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          padding: 5.5rem 1rem 3rem;
        }

        /* Cards */
        .sd-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E8E4FF;
          box-shadow: 0 1px 10px rgba(79,70,229,0.05);
          padding: 1.15rem;
          width: 100%;
          min-width: 0;
        }

        /* Stat cards row */
        .sd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        /* Study tools: 3 col on desktop */
        .sd-tools {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        /* Bottom row: 3 col on desktop */
        .sd-bottom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        /* Scan CTA card */
        .sd-scan-cta {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          border: none !important;
        }

        /* kv rows in profile/standing */
        .sd-kv { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.38rem 0; border-bottom: 1px solid #F5F3FF; }
        .sd-kv:last-child { border-bottom: none; }
        .sd-kv-key { font-size: 0.7rem; color: #94A3B8; flex-shrink: 0; }
        .sd-kv-val { font-size: 0.76rem; font-weight: 600; color: #0F172A; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 58%; }

        @keyframes sd-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.55; transform:scale(0.85); }
        }

        /* ── Tablet: 2 col ── */
        @media (max-width: 900px) {
          .sd-stats { grid-template-columns: repeat(2, 1fr); }
          .sd-tools  { grid-template-columns: repeat(2, 1fr); }
          .sd-bottom { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Mobile: 1 col ── */
        @media (max-width: 560px) {
          .sd-inner { padding: 5rem 0.85rem 3rem; }
          .sd-stats  { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
          .sd-tools  { grid-template-columns: 1fr; gap: 0.65rem; }
          .sd-bottom { grid-template-columns: 1fr; gap: 0.65rem; }
          .sd-card { padding: 1rem; }
        }
      `}</style>

      <div className="sd-root">
        <div className="sd-inner">

          {/* ── Header ────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.62rem", color: "#818CF8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                  {greeting}
                </div>
                <h1 style={{ fontSize: "clamp(1.35rem,5vw,1.9rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>
                  Welcome back, {firstName}
                </h1>
                <p style={{ color: "#94A3B8", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/scan")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "0.55rem 1.1rem", borderRadius: 11,
                  background: "#4F46E5", color: "#fff",
                  fontWeight: 700, fontSize: "0.8rem", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 3px 14px rgba(79,70,229,0.3)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                <Icon.QrCode />
                Scan QR
              </motion.button>
            </div>
          </motion.div>

          {/* ── Stat cards ────────────────────────────────────────── */}


          {/* ── Study Tools ───────────────────────────────────────── */}
          <div className="sd-tools">
            <motion.div {...fadeUp(0.14)} className="sd-card">
              <ToDoList />
            </motion.div>
            <motion.div {...fadeUp(0.17)} className="sd-card" style={{ display: "flex", flexDirection: "column" }}>
              <QuickNotes />
            </motion.div>
            <motion.div {...fadeUp(0.20)} className="sd-card">
              <StudyGoal />
            </motion.div>
          </div>

          {/* ── Bottom row ────────────────────────────────────────── */}
          <div className="sd-bottom">
            {/* Scan CTA */}
            <motion.div {...fadeUp(0.24)} className="sd-card sd-scan-cta">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon.QrCode />
                </div>
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>Quick Scan</div>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 0.9rem" }}>
                Scan the class QR code to mark your attendance instantly.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/scan")}
                style={{
                  padding: "0.45rem 1rem", borderRadius: 9,
                  background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff", fontSize: "0.76rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(4px)",
                }}>
                Open Scanner →
              </motion.button>
            </motion.div>

            {/* Profile */}
            <motion.div {...fadeUp(0.27)} className="sd-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.7rem" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon.User />
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>Profile</span>
              </div>
              {[
                ["Name",       student.name       || "—"],
                ["Enrollment", student.enrollment || "—"],
                ["Email",      student.email      || "—"],
              ].map(([k, v]) => (
                <div key={k} className="sd-kv">
                  <span className="sd-kv-key">{k}</span>
                  <span className="sd-kv-val">{v}</span>
                </div>
              ))}
            </motion.div>

            {/* Standing */}

          </div>

        </div>
      </div>

      <AIRobo />
    </DashboardLayout>
  );
}