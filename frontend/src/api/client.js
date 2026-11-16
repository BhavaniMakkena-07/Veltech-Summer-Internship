import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 120000,
});

export const scanFile   = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/scan", form);
};

export const getScan    = (id)  => api.get(`/scan/${id}`);
export const analyzeAI  = (id)  => api.post(`/analyze/${id}`);
export const getHistory = ()    => api.get("/history");
export const reportUrl  = (id)  => `http://127.0.0.1:8000/api/report/${id}`;

export default api;