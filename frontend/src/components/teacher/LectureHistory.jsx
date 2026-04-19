import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../common/DashboardLayout";
import api from "../../utils/axios";

const LectureHistory = () => {
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/lectures/history");
        setLectures(res.data.lectures || []);
      } catch {
        setLectures([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async (type, lectureId, subject) => {
    const key = `${type}-${lectureId}`;
    setDownloading(key);
    try {
      const endpoint = type === "daily"
        ? `/lectures/${lectureId}/excel`
        : `/lectures/${lectureId}/monthly-excel`;

      const res = await api.get(endpoint, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const safe = subject.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "daily" ? `${safe}_attendance.xlsx` : `${safe}_monthly.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download report.");
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (iso, type) => {
    const d = new Date(iso);
    if (type === "date") return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    if (type === "time") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return "";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={s.loadingWrap}>
          <div style={s.loadingSpinner} />
          <p style={s.loadingText}>Loading lecture history...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={s.page}>

        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={s.pageHeader}
        >
          <div>
            <h1 style={s.pageTitle}>Lecture History</h1>
            <p style={s.pageSubtitle}>
              {lectures.length > 0
                ? `${lectures.length} lecture${lectures.length !== 1 ? "s" : ""} recorded`
                : "No lecture records found"}
            </p>
          </div>

          <div style={s.statsRow}>
            <Stat label="Total Lectures" value={lectures.length} />
          </div>
        </motion.div>

        {lectures.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ─── DESKTOP ─── */}
            <div style={s.desktopGrid}>

              {/* LEFT: Lecture list */}
              <div style={s.listPanel}>
                <div style={s.listPanelHeader}>
                  <span style={s.panelLabel}>All Lectures</span>
                </div>
                <div style={s.listScroll}>
                  {lectures.map((lec, i) => (
                    <motion.div
                      key={lec._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedLecture(lec)}
                      style={
                        selectedLecture?._id === lec._id
                          ? { ...s.listItem, ...s.listItemActive }
                          : s.listItem
                      }
                    >
                      <div style={s.listItemLeft}>
                        <div style={
                          selectedLecture?._id === lec._id
                            ? { ...s.listDot, ...s.listDotActive }
                            : s.listDot
                        } />
                        <div>
                          <p style={s.listSubject}>{lec.subject}</p>
                          <p style={s.listDate}>{fmt(lec.startDateTime, "date")}</p>
                        </div>
                      </div>
                      <div style={s.completedBadge}>Completed</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Detail panel */}
              <div style={s.detailPanel}>
                {selectedLecture ? (
                  <motion.div
                    key={selectedLecture._id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    style={s.detailContent}
                  >
                    <div style={s.detailTop}>
                      <div style={s.detailIconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 style={s.detailTitle}>{selectedLecture.subject}</h2>
                        <p style={s.detailMeta}>{fmt(selectedLecture.startDateTime, "date")}</p>
                      </div>
                    </div>

                    <div style={s.detailMeta2Row}>
                      <MetaChip
                        icon={
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                        }
                        label="Start"
                        value={fmt(selectedLecture.startDateTime, "time")}
                      />
                      <MetaChip
                        icon={
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                        }
                        label="End"
                        value={fmt(selectedLecture.endDateTime, "time")}
                      />
                    </div>

                    <div style={s.detailDivider} />

                    <div style={s.reportSection}>
                      <p style={s.reportLabel}>Download Attendance Reports</p>
                      <p style={s.reportHint}>Choose daily or monthly compiled attendance sheets</p>

                      <div style={s.reportBtns}>
                        <DownloadButton
                          onClick={() => handleDownload("daily", selectedLecture._id, selectedLecture.subject)}
                          loading={downloading === `daily-${selectedLecture._id}`}
                          label="Daily Report"
                          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                          variant="dark"
                        />
                        <DownloadButton
                          onClick={() => handleDownload("monthly", selectedLecture._id, selectedLecture.subject)}
                          loading={downloading === `monthly-${selectedLecture._id}`}
                          label="Monthly Report"
                          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                          variant="outline"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div style={s.detailEmpty}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <p style={s.detailEmptyText}>Select a lecture to view details</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── MOBILE ─── */}
            <div style={s.mobileView}>
              <AnimatePresence mode="wait">
                {!selectedLecture ? (
                  <motion.div key="list" initial={{ x: 0 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div style={s.mobileListHeader}>
                      <span style={s.panelLabel}>All Lectures</span>
                    </div>
                    <div style={s.mobileList}>
                      {lectures.map((lec) => (
                        <motion.div
                          key={lec._id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedLecture(lec)}
                          style={s.mobileCard}
                        >
                          <div style={s.mobileCardLeft}>
                            <div style={s.mobileCardDot} />
                            <div>
                              <p style={s.listSubject}>{lec.subject}</p>
                              <p style={s.listDate}>{fmt(lec.startDateTime, "date")} &middot; {fmt(lec.startDateTime, "time")}</p>
                            </div>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="detail" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <button onClick={() => setSelectedLecture(null)} style={s.backBtn}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      Back to list
                    </button>

                    <div style={s.mobileDetail}>
                      <div style={s.detailTop}>
                        <div style={s.detailIconBox}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                          </svg>
                        </div>
                        <div>
                          <h2 style={s.detailTitle}>{selectedLecture.subject}</h2>
                          <p style={s.detailMeta}>{fmt(selectedLecture.startDateTime, "date")}</p>
                        </div>
                      </div>

                      <div style={s.detailMeta2Row}>
                        <MetaChip
                          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                          label="Start" value={fmt(selectedLecture.startDateTime, "time")}
                        />
                        <MetaChip
                          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                          label="End" value={fmt(selectedLecture.endDateTime, "time")}
                        />
                      </div>

                      <div style={s.detailDivider} />

                      <p style={s.reportLabel}>Download Attendance Reports</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                        <DownloadButton
                          onClick={() => handleDownload("daily", selectedLecture._id, selectedLecture.subject)}
                          loading={downloading === `daily-${selectedLecture._id}`}
                          label="Daily Report"
                          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                          variant="dark"
                          fullWidth
                        />
                        <DownloadButton
                          onClick={() => handleDownload("monthly", selectedLecture._id, selectedLecture.subject)}
                          loading={downloading === `monthly-${selectedLecture._id}`}
                          label="Monthly Report"
                          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                          variant="outline"
                          fullWidth
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const Stat = ({ label, value }) => (
  <div style={s.statCard}>
    <p style={s.statValue}>{value}</p>
    <p style={s.statLabel}>{label}</p>
  </div>
);

const MetaChip = ({ icon, label, value }) => (
  <div style={s.metaChip}>
    {icon}
    <span style={s.metaChipLabel}>{label}</span>
    <span style={s.metaChipValue}>{value}</span>
  </div>
);

const DownloadButton = ({ onClick, loading, label, icon, variant, fullWidth }) => {
  const base = {
    ...s.dlBtn,
    ...(variant === "dark" ? s.dlBtnDark : s.dlBtnOutline),
    ...(fullWidth ? { width: "100%" } : {}),
  };
  return (
    <button onClick={onClick} disabled={!!loading} style={loading ? { ...base, opacity: 0.6, cursor: "not-allowed" } : base}>
      <span style={s.btnInner}>
        {loading ? (
          <svg style={s.spin} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : icon}
        {loading ? "Downloading..." : label}
      </span>
    </button>
  );
};

const EmptyState = () => (
  <div style={s.empty}>
    <div style={s.emptyIcon}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.4">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    </div>
    <p style={s.emptyTitle}>No lecture history</p>
    <p style={s.emptyText}>Lectures you create will appear here once completed.</p>
  </div>
);

const font = "'DM Sans', 'Helvetica Neue', sans-serif";

const s = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 60px", fontFamily: font },
  pageHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: "32px", flexWrap: "wrap", gap: "16px",
  },
  pageTitle: { fontSize: "26px", fontWeight: "600", color: "#111827", margin: "0 0 4px", letterSpacing: "-0.02em" },
  pageSubtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  statsRow: { display: "flex", gap: "12px" },
  statCard: {
    background: "#f9fafb", border: "1px solid #f3f4f6",
    borderRadius: "12px", padding: "12px 20px", textAlign: "right",
  },
  statValue: { fontSize: "22px", fontWeight: "600", color: "#111827", margin: "0 0 2px" },
  statLabel: { fontSize: "12px", color: "#9ca3af", margin: 0 },

  desktopGrid: {
    display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px",
    "@media (max-width: 768px)": { display: "none" },
  },

  listPanel: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px",
    overflow: "hidden", display: "flex", flexDirection: "column",
  },
  listPanelHeader: {
    padding: "14px 18px", borderBottom: "1px solid #f3f4f6",
    background: "#fafafa",
  },
  panelLabel: { fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" },
  listScroll: { overflowY: "auto", maxHeight: "500px" },
  listItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 18px", cursor: "pointer", borderBottom: "1px solid #f9fafb",
    transition: "background 0.12s",
  },
  listItemActive: { background: "#f9fafb" },
  listItemLeft: { display: "flex", alignItems: "center", gap: "12px" },
  listDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#e5e7eb", flexShrink: 0 },
  listDotActive: { background: "#111827" },
  listSubject: { fontSize: "13px", fontWeight: "500", color: "#111827", margin: "0 0 2px" },
  listDate: { fontSize: "12px", color: "#9ca3af", margin: 0 },
  completedBadge: {
    fontSize: "11px", fontWeight: "500", padding: "3px 8px",
    background: "#f0fdf4", color: "#16a34a", borderRadius: "20px",
    border: "1px solid #bbf7d0", whiteSpace: "nowrap",
  },

  detailPanel: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px",
    overflow: "hidden", minHeight: "420px", display: "flex",
  },
  detailContent: { padding: "28px 32px", width: "100%" },
  detailEmpty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "12px", flex: 1, padding: "40px",
  },
  detailEmptyText: { fontSize: "13px", color: "#9ca3af", margin: 0 },
  detailTop: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  detailIconBox: {
    width: "44px", height: "44px", background: "#f3f4f6",
    borderRadius: "12px", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#374151", flexShrink: 0,
  },
  detailTitle: { fontSize: "20px", fontWeight: "600", color: "#111827", margin: "0 0 3px", letterSpacing: "-0.01em" },
  detailMeta: { fontSize: "13px", color: "#6b7280", margin: 0 },
  detailMeta2Row: { display: "flex", gap: "10px", marginBottom: "24px" },
  metaChip: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 12px", background: "#f9fafb",
    border: "1px solid #e5e7eb", borderRadius: "8px",
  },
  metaChipLabel: { fontSize: "12px", color: "#9ca3af" },
  metaChipValue: { fontSize: "12px", fontWeight: "500", color: "#374151" },
  detailDivider: { height: "1px", background: "#f3f4f6", margin: "0 0 24px" },
  reportSection: {},
  reportLabel: { fontSize: "14px", fontWeight: "500", color: "#111827", margin: "0 0 4px" },
  reportHint: { fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" },
  reportBtns: { display: "flex", gap: "10px", flexWrap: "wrap" },

  dlBtn: {
    padding: "10px 20px", borderRadius: "10px", fontSize: "13px",
    fontWeight: "500", cursor: "pointer", fontFamily: font,
    transition: "all 0.15s",
  },
  dlBtnDark: { background: "#111827", color: "#fff", border: "1px solid #111827" },
  dlBtnOutline: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb" },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" },
  spin: { animation: "spin 0.7s linear infinite" },

  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "8px", padding: "80px 24px",
    border: "1px solid #f3f4f6", borderRadius: "14px", background: "#fafafa",
  },
  emptyIcon: {
    width: "56px", height: "56px", background: "#f3f4f6", borderRadius: "14px",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px",
  },
  emptyTitle: { fontSize: "15px", fontWeight: "500", color: "#374151", margin: 0 },
  emptyText: { fontSize: "13px", color: "#9ca3af", margin: 0, textAlign: "center" },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "280px", gap: "14px" },
  loadingSpinner: {
    width: "24px", height: "24px", borderRadius: "50%",
    border: "2px solid #e5e7eb", borderTopColor: "#111827",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: { fontSize: "13px", color: "#9ca3af", margin: 0 },

  mobileView: { display: "none", "@media (max-width: 767px)": { display: "block" } },
  mobileListHeader: { padding: "0 0 14px" },
  mobileList: { display: "flex", flexDirection: "column", gap: "8px" },
  mobileCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: "12px", cursor: "pointer",
  },
  mobileCardLeft: { display: "flex", alignItems: "center", gap: "12px" },
  mobileCardDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#d1d5db", flexShrink: 0 },
  mobileDetail: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px",
    padding: "24px 20px",
  },
  backBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "none", border: "none", cursor: "pointer",
    fontSize: "13px", color: "#374151", fontFamily: font,
    fontWeight: "500", padding: "0", marginBottom: "20px",
  },
};

export default LectureHistory;