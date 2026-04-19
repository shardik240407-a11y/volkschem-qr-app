import axios from "axios";

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const normalized = raw.trim().replace(/\/+$/, "");

  if (/\/api$/i.test(normalized)) {
    return normalized;
  }

  return `${normalized}/api`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vchem_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
