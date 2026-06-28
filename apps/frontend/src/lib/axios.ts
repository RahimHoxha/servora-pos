import axios from "axios";

// For Electron in production, use relative URL
// For development or web browser, use absolute URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

console.log(`Using API base URL: ${API_BASE_URL}`);

export const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

axiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
