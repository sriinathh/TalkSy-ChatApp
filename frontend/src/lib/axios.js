import axios from "axios";

// API base URL: use Render backend
export const axiosInstance = axios.create({
  baseURL: "https://talksy-chatapp-18xy.onrender.com/api",
  withCredentials: true,
});
