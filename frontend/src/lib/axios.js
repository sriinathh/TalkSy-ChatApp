import axios from "axios";

// Determine API base URL:
// Priority:
// 1. VITE_API_URL (build-time)
// 2. Use the deployed Render API URL
// 3. Fallback to runtime origin + /api
const RENDER_API = "https://talksy-chatapp-18xy.onrender.com/api";
let apiBase = import.meta.env.VITE_API_URL || RENDER_API;
if (!apiBase && typeof window !== "undefined") {
  apiBase = `${window.location.origin}/api`;
}

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});
