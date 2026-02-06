import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // 🔥 THIS IS THE KEY
});

export default api;
