const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.MODE === "production"
    ? "https://classmark-8if4.onrender.com"
    : "http://localhost:5001");

export default API_BASE;