import axios from "axios";

const API_URL =
  import.meta.env.MODE === "production"
    ? "https://api.classmark.online/api"
    : "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;