import { useState, useEffect } from "react";

const CreateLecture = ({ onCreate }) => {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [radius, setRadius] = useState(50);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => { setSuccess(""); setError(""); }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationLoading(false);
        setSuccess("Classroom location detected and locked.");
      },
      () => {
        setLocationLoading(false);
        setError("Location access was denied. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!subject || !date || !startTime || !endTime) {
      setError("Please complete all required fields.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Classroom location is required. Use the button above to detect it.");
      return;
    }

    setLoading(true);
    try {
      const result = await onCreate({ subject, date, startTime, endTime, latitude, longitude, radius });
      if (result) {
        setSubject(""); setDate(""); setStartTime(""); setEndTime("");
        setRadius(50); setLatitude(null); setLongitude(null);
        setSuccess("Lecture scheduled successfully.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.iconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 style={s.title}>Schedule Lecture</h2>
            <p style={s.subtitle}>Configure timing and attendance radius</p>
          </div>
        </div>
      </div>

      <div style={s.divider} />

      <form onSubmit={handleSubmit} style={s.form}>

        <Field label="Lecture Title" required>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Introduction to Organic Chemistry"
            required
            style={s.input}
            onFocus={(e) => applyFocus(e.target)}
            onBlur={(e) => applyBlur(e.target)}
          />
        </Field>

        <Field label="Date" required>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ ...s.input, colorScheme: "light" }}
            onFocus={(e) => applyFocus(e.target)}
            onBlur={(e) => applyBlur(e.target)}
          />
        </Field>

        <div style={s.row}>
          <Field label="Start Time" required>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              style={{ ...s.input, colorScheme: "light" }}
              onFocus={(e) => applyFocus(e.target)}
              onBlur={(e) => applyBlur(e.target)}
            />
          </Field>
          <Field label="End Time" required>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              style={{ ...s.input, colorScheme: "light" }}
              onFocus={(e) => applyFocus(e.target)}
              onBlur={(e) => applyBlur(e.target)}
            />
          </Field>
        </div>

        <Field label="Attendance Radius" hint={`${radius} meters`}>
          <div style={s.sliderRow}>
            <span style={s.sliderLabel}>10m</span>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={s.slider}
            />
            <span style={s.sliderLabel}>500m</span>
          </div>
          <p style={s.sliderValue}>{radius} meters — students must be within this range to mark attendance</p>
        </Field>

        <Field label="Classroom Location" required>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            style={locationLoading ? { ...s.locationBtn, ...s.btnDisabled } : s.locationBtn}
          >
            <span style={s.btnInner}>
              {locationLoading ? (
                <>
                  <svg style={s.spin} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Detecting location...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                  </svg>
                  Detect Classroom Location
                </>
              )}
            </span>
          </button>

          {latitude && longitude && (
            <div style={s.locationConfirmed}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Location locked — {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
            </div>
          )}
        </Field>

        {error && <Banner type="error">{error}</Banner>}
        {success && <Banner type="success">{success}</Banner>}

        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...s.submit, ...s.btnDisabled } : s.submit}
        >
          <span style={s.btnInner}>
            {loading ? (
              <>
                <svg style={s.spin} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Scheduling...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Lecture
              </>
            )}
          </span>
        </button>

      </form>
    </div>
  );
};

const Field = ({ label, required, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={s.label}>
      {label}
      {required && <span style={s.req}> *</span>}
      {hint && <span style={s.hint}> — {hint}</span>}
    </label>
    {children}
  </div>
);

const Banner = ({ type, children }) => (
  <div style={type === "error" ? s.errorBanner : s.successBanner}>
    {children}
  </div>
);

const applyFocus = (el) => {
  el.style.background = "#fff";
  el.style.border = "1px solid #111827";
  el.style.boxShadow = "0 0 0 3px rgba(17,24,39,0.06)";
};

const applyBlur = (el) => {
  el.style.background = "#f9fafb";
  el.style.border = "1px solid #e5e7eb";
  el.style.boxShadow = "none";
};

const s = {
  card: {
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    maxWidth: "560px",
    width: "100%",
  },
  header: { padding: "24px 28px 20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  iconBox: {
    width: "38px", height: "38px", background: "#f3f4f6",
    borderRadius: "10px", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#374151",
  },
  title: { fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 2px", letterSpacing: "-0.01em" },
  subtitle: { fontSize: "13px", color: "#6b7280", margin: 0 },
  divider: { height: "1px", background: "#f3f4f6" },
  form: { padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  req: { color: "#dc2626" },
  hint: { color: "#9ca3af", fontWeight: "400", fontSize: "12px" },
  input: {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    color: "#111827", background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: "10px", outline: "none", transition: "all 0.15s",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  },
  sliderRow: { display: "flex", alignItems: "center", gap: "12px" },
  slider: { flex: 1, accentColor: "#111827", cursor: "pointer", height: "4px" },
  sliderLabel: { fontSize: "12px", color: "#9ca3af", minWidth: "30px" },
  sliderValue: { fontSize: "12px", color: "#6b7280", margin: "4px 0 0" },
  locationBtn: {
    width: "100%", padding: "10px 14px",
    background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: "10px", fontSize: "14px", fontWeight: "500",
    color: "#374151", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
  },
  locationConfirmed: {
    display: "flex", alignItems: "center", gap: "7px",
    padding: "8px 12px", background: "#f0fdf4",
    border: "1px solid #bbf7d0", borderRadius: "8px",
    fontSize: "12px", color: "#16a34a", marginTop: "8px",
    fontWeight: "500",
  },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  submit: {
    width: "100%", padding: "12px", background: "#111827",
    color: "#fff", border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", marginTop: "4px",
  },
  btnDisabled: { background: "#9ca3af", cursor: "not-allowed" },
  spin: { animation: "spin 0.8s linear infinite" },
  errorBanner: {
    padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", fontSize: "13px", color: "#dc2626",
  },
  successBanner: {
    padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "8px", fontSize: "13px", color: "#16a34a",
  },
};

export default CreateLecture;