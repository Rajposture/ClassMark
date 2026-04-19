import { useState } from "react";
import API_BASE from "../../config/api";

const CreateAssignment = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("dueDate", dueDate);
      if (image) formData.append("image", image);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/assignments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create assignment");

      setTitle("");
      setSubject("");
      setDescription("");
      setDueDate("");
      setImage(null);
      setPreview(null);
      setSuccess("Assignment posted successfully.");
      if (onCreated) onCreated(data.assignment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.cardTitle}>New Assignment</h2>
            <p style={styles.cardSubtitle}>Post a task for enrolled students</p>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Assignment Title <span style={styles.required}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Research Paper on Thermodynamics"
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Subject <span style={styles.required}>*</span></label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics 301"
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Description <span style={styles.optional}>(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed instructions, grading criteria, or references..."
            rows={4}
            style={styles.textarea}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Due Date <span style={styles.required}>*</span></label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            style={{ ...styles.input, colorScheme: "light" }}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, styles.input)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Reference Image <span style={styles.optional}>(optional)</span></label>

          {!preview ? (
            <label style={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <div style={styles.uploadInner}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <span style={styles.uploadText}>Click to upload image</span>
                <span style={styles.uploadHint}>PNG, JPG, WEBP — max 10MB</span>
              </div>
            </label>
          ) : (
            <div style={styles.previewWrapper}>
              <img src={preview} alt="Preview" style={styles.previewImg} />
              <button type="button" onClick={removeImage} style={styles.removeBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Remove
              </button>
            </div>
          )}
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}
        {success && <div style={styles.successBanner}>{success}</div>}

        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
        >
          {loading ? (
            <span style={styles.btnInner}>
              <svg style={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Posting...
            </span>
          ) : (
            <span style={styles.btnInner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Post Assignment
            </span>
          )}
        </button>

      </form>
    </div>
  );
};

const base = {
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
};

const styles = {
  card: {
    ...base,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    maxWidth: "680px",
    width: "100%",
  },
  cardHeader: {
    padding: "24px 28px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  iconBox: {
    width: "38px",
    height: "38px",
    background: "#f3f4f6",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 2px",
    letterSpacing: "-0.01em",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },
  divider: {
    height: "1px",
    background: "#f3f4f6",
  },
  form: {
    padding: "24px 28px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    letterSpacing: "0.01em",
  },
  required: {
    color: "#dc2626",
    marginLeft: "2px",
  },
  optional: {
    color: "#9ca3af",
    fontWeight: "400",
    fontSize: "12px",
    marginLeft: "4px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#111827",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  inputFocus: {
    background: "#ffffff",
    border: "1px solid #111827",
    boxShadow: "0 0 0 3px rgba(17,24,39,0.06)",
    borderRadius: "10px",
    outline: "none",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#111827",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#111827",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: "1.6",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  uploadZone: {
    display: "block",
    border: "1.5px dashed #d1d5db",
    borderRadius: "10px",
    padding: "28px",
    cursor: "pointer",
    transition: "border-color 0.15s",
    background: "#fafafa",
  },
  uploadInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  uploadText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  uploadHint: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  previewWrapper: {
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  previewImg: {
    width: "100%",
    display: "block",
    maxHeight: "220px",
    objectFit: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "5px 10px",
    fontSize: "12px",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
  },
  errorBanner: {
    padding: "10px 14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#dc2626",
  },
  successBanner: {
    padding: "10px 14px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#16a34a",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.01em",
    transition: "background 0.15s, transform 0.1s",
    marginTop: "4px",
  },
  submitBtnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
    transform: "none",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    animation: "spin 0.8s linear infinite",
  },
};

export default CreateAssignment;