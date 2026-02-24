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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("dueDate", dueDate);

      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create assignment");
      }

      setTitle("");
      setSubject("");
      setDescription("");
      setDueDate("");
      setImage(null);
      setPreview(null);

      if (onCreated) {
        onCreated(data.assignment);
      }

      alert("Assignment created successfully");
    } catch (error) {
      console.error(error);
      alert(error.message);
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

  return (
    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-xl rounded-3xl p-8 transition duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
        Create Assignment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition resize-none"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600">
            Upload Assignment Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm"
          />

          {preview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={preview}
                alt="Preview"
                className="w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white font-medium tracking-wide transition duration-200 hover:bg-gray-900 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post Assignment"}
        </button>

      </form>
    </div>
  );
};

export default CreateAssignment;