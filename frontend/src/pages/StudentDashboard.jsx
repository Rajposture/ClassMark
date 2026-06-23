import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import AIRobo from "../components/ai/AIRobo";
import PageSkeleton from "../components/ui/PageSkeleton";

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Calendar: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  BookOpen: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Flame: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  QrCode: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      <path d="M3 17h2v2H3zM7 17h2v2H7zM3 13h2v2H3zM7 13h2v2H7z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  ),
  User: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Alert: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Target: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Pencil: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Notes: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

// ─── DonutRing ────────────────────────────────────────────────────────────────
function DonutRing({ pct, size = 104, stroke = 9, color = "#4F46E5", track = "#E0E7FF" }) {
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
        transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
  const remove  = (id) => save(items.filter(i => i.id !== id));

  const pc = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };
  const sorted = [...items].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return (a.done ? 10 : 0) - (b.done ? 10 : 0) || o[a.priority] - o[b.priority];
  });
  const done = items.filter(i => i.done).length;
  const pct  = items.length ? (done / items.length) * 100 : 0;

  return (
    <div>
      <div className="todo-header">
        <div>
          <h2 className="card-title">To-Do List</h2>
          <div className="todo-sub">{done}/{items.length} completed</div>
        </div>
        {items.length > 0 && (
          <div className="todo-prog-wrap">
            <motion.div className="todo-prog-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        )}
      </div>

      <div className="todo-add-row">
        <input
          className="todo-input"
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {["high", "medium", "low"].map(p => (
            <button key={p} onClick={() => setPriority(p)} className="pri-dot" title={p}
              style={{
                background: priority === p ? pc[p] : pc[p] + "30",
                border: `2px solid ${priority === p ? pc[p] : "transparent"}`,
              }}
            />
          ))}
        </div>
        <button className="todo-add-btn" onClick={add} aria-label="Add task"><Icon.Plus /></button>
      </div>

      <div className="todo-list">
        <AnimatePresence initial={false}>
          {sorted.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="todo-empty">
              No tasks yet. Add one to get started.
            </motion.div>
          )}
          {sorted.map(item => (
            <motion.div
              key={item.id} layout
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`todo-item${item.done ? " done" : ""}`}
            >
              <button className="todo-check" onClick={() => toggle(item.id)} style={{ borderColor: pc[item.priority] }}>
                {item.done && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={pc[item.priority]} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className="todo-text">{item.text}</span>
              <span className="todo-chip" style={{ background: pc[item.priority] + "20", color: pc[item.priority] }}>{item.priority}</span>
              <button className="todo-del" onClick={() => remove(item.id)}><Icon.Trash /></button>
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

  const handleChange = (e) => {
    setNotes(e.target.value);
    setSaved(false);
  };
  const handleSave = () => {
    try { localStorage.setItem("sd_notes", notes); } catch {}
    setSaved(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".75rem" }}>
        <div className="card-icon-row">
          <div className="card-icon-bg" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Icon.Notes /></div>
          <h3 className="card-title">Quick Notes</h3>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: ".28rem .75rem", borderRadius: 7, border: "none",
            background: saved ? "#F0EFFE" : "#4F46E5",
            color: saved ? "#94A3B8" : "#fff",
            fontSize: ".72rem", fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all .2s",
          }}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <textarea
        className="notes-area"
        placeholder="Jot down formulas, reminders, or anything you need…"
        value={notes}
        onChange={handleChange}
        onBlur={handleSave}
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

  const setHours = (h) => {
    setGoal(h);
    try { localStorage.setItem("sd_goal", h); } catch {}
  };
  const logHour = () => {
    if (done >= goal) return;
    const next = done + 1;
    setDone(next);
    try { localStorage.setItem("sd_goal_done", next); } catch {}
  };
  const reset = () => {
    setDone(0);
    try { localStorage.setItem("sd_goal_done", 0); } catch {}
  };

  const pct = Math.min((done / goal) * 100, 100);

  return (
    <div>
      <div className="card-icon-row" style={{ marginBottom: ".75rem" }}>
        <div className="card-icon-bg" style={{ background: "#FEF3C7", color: "#D97706" }}><Icon.Target /></div>
        <h3 className="card-title">Daily Study Goal</h3>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: ".9rem" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <DonutRing pct={pct} size={80} stroke={8} color={pct >= 100 ? "#10B981" : "#F59E0B"} track="#FEF3C7" />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{done}h</span>
            <span style={{ fontSize: ".55rem", color: "#94A3B8" }}>of {goal}h</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: ".78rem", color: "#64748B", marginBottom: ".5rem" }}>Daily target</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[2, 4, 6, 8].map(h => (
              <button key={h} onClick={() => setHours(h)} style={{
                padding: ".25rem .6rem", borderRadius: 6,
                background: goal === h ? "#4F46E5" : "#F0EFFE",
                color: goal === h ? "#fff" : "#4F46E5",
                border: "none", fontSize: ".72rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
              }}>{h}h</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={logHour} disabled={done >= goal} style={{
          flex: 1, padding: ".45rem .75rem", borderRadius: 9,
          background: done >= goal ? "#F0EFFE" : "#4F46E5",
          color: done >= goal ? "#C4B5FD" : "#fff",
          border: "none", fontSize: ".78rem", fontWeight: 600,
          cursor: done >= goal ? "default" : "pointer",
          fontFamily: "inherit", transition: "all .2s",
        }}>
          {done >= goal ? "Goal reached" : "+ Log 1 hour"}
        </button>
        <button onClick={reset} style={{
          padding: ".45rem .75rem", borderRadius: 9,
          background: "#F0EFFE", color: "#94A3B8",
          border: "none", fontSize: ".72rem", fontWeight: 600,
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
  const [tab, setTab]           = useState("today");
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
      todaySessions: [
        { subject: "Data Structures",   time: "9:00 AM",  status: "present",  code: "CS301"  },
        { subject: "Operating Systems", time: "11:00 AM", status: "present",  code: "CS302"  },
        { subject: "Computer Networks", time: "2:00 PM",  status: "upcoming", code: "CS303"  },
        { subject: "Database Lab",      time: "4:00 PM",  status: "upcoming", code: "CS304L" },
      ],
      recentSessions: [
        { subject: "Software Engineering", time: "Yesterday 10:00 AM", status: "absent",  code: "CS305" },
        { subject: "Data Structures",      time: "Yesterday 9:00 AM",  status: "present", code: "CS301" },
        { subject: "Database Systems",     time: "Mon 3:00 PM",        status: "present", code: "CS304" },
        { subject: "Computer Networks",    time: "Mon 2:00 PM",        status: "present", code: "CS303" },
      ],
      alerts: [
        { msg: "Operating Systems at 68% — attend the next 3 classes to recover." },
        { msg: "Software Engineering at 67% — at risk of detention." },
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
            style={{ color: "#4F46E5", fontWeight: 600, fontSize: ".9rem" }}>
            Loading dashboard…
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const { overallAttendance, totalClasses, attended, streak, rank, totalStudents, subjects, todaySessions, recentSessions, alerts } = dashData;
  const firstName = student.name?.split(" ")[0] || "Student";
  const atRisk = subjects.filter(s => s.pct < 75).length;
  const safe   = subjects.filter(s => s.pct >= 75).length;
  const canSkip = Math.floor((attended - 0.75 * totalClasses) / 0.75);
  const needAttend = Math.ceil((0.75 * totalClasses - attended) / 0.25);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .dash-root { font-family: 'Inter', sans-serif; background: #F5F3FF; min-height: 100vh; }
        .dash-inner {
          max-width: 1180px; margin: 0 auto;
          padding: clamp(5.5rem,8vw,6.5rem) clamp(1rem,4vw,2.5rem) 3rem;
        }

        .card {
          background: #fff; border-radius: 16px;
          border: 1px solid #E8E4FF;
          box-shadow: 0 1px 10px rgba(79,70,229,0.05);
          padding: 1.35rem;
        }
        .card-title { font-size: .92rem; font-weight: 700; color: #0F172A; margin: 0; }
        .card-icon-row { display: flex; align-items: center; gap: 8px; margin-bottom: .7rem; }
        .card-icon-bg {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .g3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }

        .alert-item {
          display: flex; align-items: flex-start; gap: 9px;
          padding: .65rem 1rem; border-radius: 10px;
          background: #FFFBEB; border: 1px solid #FDE68A;
          font-size: .79rem; color: #92400E; line-height: 1.5;
        }
        .alert-icon { color: #D97706; margin-top: 1px; flex-shrink: 0; }

        .btn-scan {
          display: inline-flex; align-items: center; gap: 7px;
          padding: .6rem 1.25rem; border-radius: 11px;
          background: #4F46E5; color: #fff;
          font-weight: 700; font-size: .82rem; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 3px 14px rgba(79,70,229,0.3);
          transition: transform .2s, box-shadow .2s; white-space: nowrap;
        }
        .btn-scan:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.38); }
        .btn-scan:active { transform: scale(.97); }

        .scan-cta { background: linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%); border: none; color: #fff; }
        .scan-cta .card-title { color: #fff; }
        .scan-cta p { font-size: .78rem; color: rgba(255,255,255,.78); line-height: 1.6; margin: .3rem 0 1rem; }
        .scan-cta-btn {
          padding: .48rem 1rem; border-radius: 9px;
          background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.3);
          color: #fff; font-size: .78rem; font-weight: 700;
          cursor: pointer; font-family: inherit; backdrop-filter: blur(4px);
          transition: background .2s;
        }
        .scan-cta-btn:hover { background: rgba(255,255,255,.28); }

        .kv-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: 1rem; padding: .4rem 0; border-bottom: 1px solid #F5F3FF;
        }
        .kv-row:last-child { border-bottom: none; }
        .kv-key { font-size: .72rem; color: #94A3B8; flex-shrink: 0; }
        .kv-val {
          font-size: .79rem; font-weight: 600; color: #0F172A;
          text-align: right; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; max-width: 60%;
        }

        .todo-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: .9rem; gap: 1rem;
        }
        .todo-sub { font-size: .67rem; color: #94A3B8; font-weight: 500; margin-top: 3px; }
        .todo-prog-wrap {
          flex: 1; max-width: 120px; height: 4px;
          background: #EEF2FF; border-radius: 999px; overflow: hidden;
        }
        .todo-prog-fill { height: 4px; background: linear-gradient(90deg,#4F46E5,#818CF8); border-radius: 999px; }
        .todo-add-row { display: flex; align-items: center; gap: 7px; margin-bottom: .9rem; }
        .todo-input {
          flex: 1; padding: .55rem .8rem; border-radius: 9px;
          border: 1.5px solid #E8E4FF; font-size: .8rem; font-family: inherit;
          color: #0F172A; outline: none; background: #FAFAFE; transition: border-color .2s;
        }
        .todo-input::placeholder { color: #C4B5FD; }
        .todo-input:focus { border-color: #4F46E5; background: #fff; }
        .pri-dot {
          width: 13px; height: 13px; border-radius: 50%;
          cursor: pointer; transition: transform .15s; flex-shrink: 0;
        }
        .pri-dot:hover { transform: scale(1.35); }
        .todo-add-btn {
          width: 32px; height: 32px; border-radius: 9px;
          background: #4F46E5; color: #fff; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: background .2s;
        }
        .todo-add-btn:hover { background: #4338CA; }
        .todo-list { display: flex; flex-direction: column; overflow-y: auto; max-height: 220px; }
        .todo-empty { font-size: .78rem; color: #C4B5FD; text-align: center; padding: 1.25rem 0; }
        .todo-item {
          display: flex; align-items: center; gap: 9px;
          padding: .5rem 0; border-bottom: 1px solid #F5F3FF; overflow: hidden;
        }
        .todo-item:last-child { border-bottom: none; }
        .todo-item.done .todo-text { text-decoration: line-through; color: #C4B5FD; }
        .todo-check {
          width: 17px; height: 17px; border-radius: 5px;
          border: 2px solid #C4B5FD; background: transparent;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: border-color .2s;
        }
        .todo-text { flex: 1; font-size: .8rem; color: #0F172A; min-width: 0; transition: color .2s; }
        .todo-chip {
          font-size: .58rem; font-weight: 700; text-transform: uppercase;
          padding: 2px 6px; border-radius: 999px; flex-shrink: 0; letter-spacing: .04em;
        }
        .todo-del {
          background: none; border: none; cursor: pointer;
          color: #C4B5FD; display: flex; align-items: center;
          padding: 3px; border-radius: 5px; transition: color .2s, background .2s; flex-shrink: 0;
        }
        .todo-del:hover { color: #EF4444; background: #FEE2E2; }

        .notes-area {
          width: 100%; min-height: 110px; resize: vertical;
          border: 1.5px solid #E8E4FF; border-radius: 10px;
          padding: .7rem .85rem; font-size: .8rem; font-family: inherit;
          color: #0F172A; background: #FAFAFE; outline: none;
          transition: border-color .2s; line-height: 1.6; box-sizing: border-box;
        }
        .notes-area::placeholder { color: #C4B5FD; }
        .notes-area:focus { border-color: #4F46E5; background: #fff; }

        @media(max-width: 960px) {
          .g3 { grid-template-columns: repeat(2,1fr); }
        }
        @media(max-width: 640px) {
          .g3 { grid-template-columns: 1fr; }
          .dash-inner { padding-top: 5rem; }
        }
      `}</style>

      <div className="dash-root">
        <div className="dash-inner">

          {/* ── Header ──────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: ".64rem", color: "#818CF8", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".3rem" }}>
                  {greeting}
                </div>
                <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#0F172A", letterSpacing: "-.03em", lineHeight: 1.1, margin: 0 }}>
                  Welcome back, {firstName}
                </h1>
                <p style={{ color: "#94A3B8", marginTop: ".35rem", fontSize: ".82rem", margin: ".35rem 0 0" }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <motion.button className="btn-scan" whileTap={{ scale: 0.96 }} onClick={() => navigate("/scan")}>
                <Icon.QrCode />
                Scan QR
              </motion.button>
            </div>
          </motion.div>

          {/* ── Study tools: To-Do + Notes + Study Goal ─────────── */}
          <div className="g3" style={{ marginBottom: "1rem" }}>
            <motion.div {...fadeUp(0.30)} className="card">
              <ToDoList />
            </motion.div>
            <motion.div {...fadeUp(0.33)} className="card">
              <QuickNotes />
            </motion.div>
            <motion.div {...fadeUp(0.36)} className="card">
              <StudyGoal />
            </motion.div>
          </div>

          {/* ── Bottom: Scan CTA + Profile + Standing ───────────── */}
          <div className="g3">
            <motion.div {...fadeUp(0.40)} className="card scan-cta">
              <div className="card-icon-row">
                <div className="card-icon-bg" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Icon.QrCode /></div>
              </div>
              <h3 className="card-title">Quick Scan</h3>
              <p>Scan the class QR code to mark your attendance instantly.</p>
              <motion.button className="scan-cta-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .96 }} onClick={() => navigate("/scan")}>
                Open Scanner
                <span style={{ marginLeft: 4, opacity: .8 }}>&rarr;</span>
              </motion.button>
            </motion.div>

            <motion.div {...fadeUp(0.43)} className="card">
              <div className="card-icon-row">
                <div className="card-icon-bg" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Icon.User /></div>
                <h3 className="card-title">Profile</h3>
              </div>
              {[
                ["Name",       student.name       || "—"],
                ["Enrollment", student.enrollment || "—"],
                ["Email",      student.email      || "—"],
              ].map(([k, v]) => (
                <div key={k} className="kv-row">
                  <span className="kv-key">{k}</span>
                  <span className="kv-val">{v}</span>
                </div>
              ))}
            </motion.div>

            <motion.div {...fadeUp(0.46)} className="card">
              <div className="card-icon-row">
                <div className="card-icon-bg" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Icon.Trophy /></div>
                <h3 className="card-title">Standing</h3>
              </div>
              {[
                ["Class Rank",     `#${rank} / ${totalStudents}`,                   "#4F46E5"],
                ["Safe Subjects",  `${safe} / ${subjects.length}`,                  "#10B981"],
                ["At Risk",        `${atRisk} subject${atRisk !== 1 ? "s" : ""}`,   atRisk > 0 ? "#EF4444" : "#10B981"],
                ["Current Streak", `${streak} day${streak !== 1 ? "s" : ""}`,       "#F59E0B"],
              ].map(([k, v, c]) => (
                <div key={k} className="kv-row">
                  <span className="kv-key">{k}</span>
                  <span className="kv-val" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      <AIRobo />
    </DashboardLayout>
  );
}